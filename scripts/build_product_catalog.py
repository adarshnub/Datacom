"""Build the website product-document index from the client-supplied source library.

The source PDFs remain the authority. This script creates a lightweight JSON index
for search/filtering and optimized WebP previews from the supplied product photos.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageOps
from pypdf import PdfReader

# The client library contains legitimate print-production artwork above Pillow's
# default pixel threshold (the largest is roughly 218 MP). Keep a finite ceiling
# while allowing those trusted originals to be downsampled for the web catalogue.
Image.MAX_IMAGE_PIXELS = 250_000_000


ROOT = Path(__file__).resolve().parents[1]
SPEC_ROOT = ROOT / "client-docs" / "SPECIFICATION SHEETS"
IMAGE_ROOT = ROOT / "client-docs" / "PRODUCT IMAGES"
OUTPUT_JSON = ROOT / "app" / "data" / "product-catalog.json"
OUTPUT_PUBLIC_JSON = ROOT / "app" / "data" / "product-catalog-public.json"
OUTPUT_FEATURED_JSON = ROOT / "app" / "data" / "featured-products.json"
OUTPUT_SKU_JSON = ROOT / "app" / "data" / "sku-catalog-public.json"
OUTPUT_HIERARCHY_JSON = ROOT / "app" / "data" / "product-hierarchy.json"
OUTPUT_GROUPS_JSON = ROOT / "app" / "data" / "nested-products-public.json"
OUTPUT_IMAGES = ROOT / "public" / "product-catalog"

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
PART_NUMBER_PATTERN = re.compile(r"(?<![A-Z0-9])DC-[A-Z0-9][A-Z0-9./_-]{4,}", re.I)


IMAGE_RULES = [
    (r"D-SENSE.*KNX", "BMS CABLE_PHOTO/DATACOM D-SENSE SERIES KNX CABLE/D-SENSE SERIES KNX CABLE.png"),
    (r"D-SENSE.*RS485", "BMS CABLE_PHOTO/DATACOM D-SENSE SERIES RS485 AUTOMATION CABLE/D-SENSE SERIES RS485 AUTOMATION CABLE- SHIELDED WITH FOILED.png"),
    (r"D-SENSE.*PUBLIC ADDRESS", "BMS CABLE_PHOTO/DATACOM D-SENSE SERIES PUBLIC ADDRESS CABLE/D-SENSE SERIES PUBLIC ADDRESS CABLE.png"),
    (r"D-SENSE.*AUDIO.*UNSHIELDED", "BMS CABLE_PHOTO/DATACOM D-SENSE SERIES AUDIO CONTROL & INSTRUMENTATION CABLE (UNSHIELDED)/D-SENSE SERIES AUDIO CONTROL & INSTRUMENTATION CABLE (UNSHIELDED).png"),
    (r"D-SENSE.*AUDIO", "BMS CABLE_PHOTO/DATACOM D-SENSE SERIES AUDIO CONTROL & INSTRUMENTATION CABLE (SHIELDED)/D-SENSE SERIES AUDIO CONTROL &INSTRUMENTATION CABLE (SHIELDED).png"),
    (r"D-SENSE.*CONTROL CABLE", "BMS CABLE_PHOTO/DATACOM D-SENSE SERIES CONTROL CABLE-SHIELDED/D-SENSE SERIES CONTROL CABLE-SHIELDED.png"),
    (r"D-SENSE", "BMS CABLE_PHOTO/DATACOM D-SENSE SERIES CONTROL AND INSTRUMENTATION/D-SENSE SERIES CONTROL AND INSTRUMENTATION.png"),
    (r"QNET.*CASSET", "Data Center (DC) connectivity Products/MPO CASSETTES AND CHASSIS PANEL/CASSTS.png"),
    (r"QNET.*PANEL|EPATCH|144 PORT.*PATCH PANEL", "Data Center (DC) connectivity Products/MPO CASSETTES AND CHASSIS PANEL/PANEL.png"),
    (r"MPO.*TRUNK|HYBRID CABLE", "Data Center (DC) connectivity Products/PRE-TERMINATED MPOMTP CABLING/a-gm-m-ad-yellow-cable-and-green-jacket-black-boot-10-11-2019-jpg.jpg"),
    (r"SERVER CABINET|SX SERIES", "DATACENTER CABINET/SERVER CABINETS/1-3 Server Cabinet, DATACENTER SERVER CABINET, DCS-SERIES.jpg"),
    (r"FLOOR STANDING", "CABINET & ENCLOSURES/FLOOR STANADING CABINET/FLOOR STANDING CABINET.jpg"),
    (r"WALL.?MOUNT|RECESSED CABINET|FLUSH MOUNT", "CABINET & ENCLOSURES/WALL MOUNT CABINET/SINGLE SECTION/single section wall mount cabinet.jpg"),
    (r"OUTDOOR.*CABINET|FIBERGLASS|STAINLESS STEEL", "OUTDOOR CABINETS/IMAGES/1-3 OUTDOOR EQUIPMENT CABINET WITH COOLING AND MONITORING.jpg"),
    (r"INTELLIGENT POWER|MAG SERIES|SMART PDU", "POWER DISTRIBUTION UNITS/SMART PDU/COO-TURKEY/DC-SERIES.png"),
    (r"HORIZONTAL POWER", "POWER DISTRIBUTION UNITS/BASIC PDU/HORIZONTAL POWER DISTRIBUTION UNIT/BASIC HORIZONTAL PDU.jpg"),
    (r"POWER DISTRIBUTION|PDU", "POWER DISTRIBUTION UNITS/BASIC PDU/BASIC PDU/1-2 BASIC VERTICAL PDU.jpg"),
    (r"CAT.?8.*CABLE", "COPPER CABLES/CAT8 CABLE/CAT8 SFTP 23AWG CABLE LSZH/CAT8 SFTP 23AWG CABLE LSZH.jpg"),
    (r"CAT.?6A.*CABLE", "COPPER CABLES/CAT6A CABLE/CAT 6A SFTP 23 AWG CABLE LSZH/CAT6A SFTP 23AWG CABLE LSZH.jpg"),
    (r"CAT.?6.*CABLE", "COPPER CABLES/CAT 6 CABLE/CAT 6 UTP 23AWG CABLE LSZH/CAT 6 UTP 23AWG CABLE LSZH.jpg"),
    (r"CAT.?8.*KEYSTONE", "COPPER CONNECTIVITY/KEYSTONE JACKS AND PLUG/CAT 8 KEYSTONE JCKS/CAT8 SHIELDED KEYSTONE JACKS.png"),
    (r"KEYSTONE", "COPPER CONNECTIVITY/KEYSTONE JACKS AND PLUG/CAT 6A SHIELDED TOOL LESS KEYSTONE JACK/CAT 6A SHIELDED TOOL LESS KEYSTONE JACK.png"),
    (r"MODULAR.*PATCH PANEL|LOADED PATCH PANEL", "COPPER CONNECTIVITY/PATCH PANEL/SHIELDED/1-1 MODULAR SHEILDED PATCH PANEL.jpg"),
    (r"COPPER.*PATCH CORD|CAT.*PATCH CORD", "COPPER CONNECTIVITY/COPPER PATCH CORD/STP/CAT 6A SFTP SLIM PATCHCORDS, 26AWG/CAT 6A SFTP SLIM PATCHCORDS, 26AWG.jpg"),
    (r"DOME CLOSURE", "FIBER OPTIC/FIBER MANAGEMENT ENCLOSURES/DOME ENCLOSURES/1-2 DOME ENCLOSURES.jpg"),
    (r"INLINE.*CLOSURE", "FIBER OPTIC/FIBER MANAGEMENT ENCLOSURES/INLINE ENCLOSURES/1-3 INLINE ENCLOSURES.jpg"),
    (r"PLC SPLITTER|SPLITTER MODULE", "FIBER OPTIC/PLC SPLITTERS/19 INCH PLC SPLITTER/1-3 19 INCH PLC SPLITTER.jpg"),
    (r"MICRO ODF|DISTRIBUTION BOX|TERMINATION BOX", "FIBER OPTIC/FIBER MANAGEMENT ENCLOSURES/FIBER TERMINATION BOXES/INDOOR TERMINATION BOXES/1-2 MICRO ODF.jpg"),
    (r"FIBER.*PATCH PANEL|SLIDING FIBER", "FIBER OPTIC/FIBER PANEL AND ADAPTERS/FIBER PATCH PANEL RACK MOUNT/1-2 FIBER PATCH PANEL RACK MOUNT.jpg"),
    (r"FIBER.*PATCH CORD|UNIBOOT", "FIBER OPTIC/PIGTAILS AND PATCH CORDS/INDOOR FIBER PATCH CORDS/1-6 PATCH CORDS.jpg"),
    (r"FIBER OPTIC.*CABLE|LOOSE TUBE|TIGHT BUFFER|DROP CABLE|MICRO MODULE", "FIBER OPTIC/FIBER CABLES/INDOOR OUTDOOR/1-3INDOOR OUTDOOR.jpg"),
    (r"CABLE MANAGER|CABINET ACCESSORIES|OPEN RACK", "CABINET & ENCLOSURES/CABLE MANAGEMENT ACCESSORIES/CABLE MANAGEMENT ACCESSORIES.jpg"),
]


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def preferred_source(path: Path) -> tuple[int, int, str]:
    relative = path.relative_to(SPEC_ROOT).as_posix().upper()
    penalty = 0
    penalty += 100 if "/OLD/" in f"/{relative}" else 0
    penalty += 50 if " - COPY" in relative else 0
    penalty += 20 if "REV01" not in relative and "REV02" not in relative and "-R0" not in relative else 0
    priority = 0 if relative.startswith("DATACENTER/") else 1
    return penalty, priority, relative


def clean_title(path: Path) -> str:
    title = path.stem
    title = re.sub(r"^DATACOM[ -]+", "", title, flags=re.I)
    title = re.sub(r"\s*-?\s*(?:COPY|REV(?:ISION)?[- ]?\d+|R\d{2})$", "", title, flags=re.I)
    title = re.sub(r"\s+", " ", title).strip(" ,-_")
    if title.isupper():
        title = title.title()
    replacements = {
        "Datacenter": "Data Centre",
        "Cat6a": "Cat6A",
        "Cat6": "Cat6",
        "Cat 6a": "Cat6A",
        "Cat 6": "Cat6",
        "Cat 8": "Cat8",
        "Sftp": "S/FTP",
        "Uutp": "U/UTP",
        "Utp": "UTP",
        "Fftp": "F/FTP",
        "Lszh": "LSZH",
        "Mpo": "MPO",
        "Lc": "LC",
        "Pdu": "PDU",
        "Ftth": "FTTH",
        "OdF": "ODF",
        "Ip68": "IP68",
        "Qnet": "QNET",
        "D-Sense": "D-SENSE",
    }
    for source, target in replacements.items():
        title = re.sub(rf"\b{re.escape(source)}\b", target, title, flags=re.I)
    return title


def classify(relative: str, title: str) -> str:
    upper = f"{relative} {title}".upper()
    if (
        relative.startswith("DATACENTER/")
        or "QNET" in upper
        or "EPATCH" in upper
        or "DATA CENTRE SERVER CABINET" in upper
    ):
        return "Data Centre"
    if relative.startswith("COPPER/"):
        return "Copper"
    if relative.startswith("FIBER SOLUTION/") or "HYBRID CABLE" in upper:
        return "Fibre"
    if relative.startswith("PDU/") or "PDU" in upper or "POWER DISTRIBUTION" in upper or " UPS" in upper:
        return "Power"
    if "D-SENSE" in upper:
        return "Building Systems"
    return "Cabinets"


def extract_text(path: Path) -> tuple[str, int]:
    try:
        reader = PdfReader(str(path))
        text = " ".join((page.extract_text() or "") for page in reader.pages)
        return re.sub(r"\s+", " ", text), len(reader.pages)
    except Exception:
        return "", 0


def extract_part_numbers(text: str) -> list[str]:
    normalized = text.translate(str.maketrans({"–": "-", "—": "-", "−": "-", "‑": "-"})).upper()
    codes: set[str] = set()
    for match in PART_NUMBER_PATTERN.findall(normalized):
        code = match.rstrip(".,;:)-_/")
        code = re.sub(r"-{2,}", "-", code)
        code = re.sub(r"DATACOM$", "", code).rstrip("-")
        if len(code) >= 8 and not code.startswith(("DC-IEC", "DC-ISO", "DC-CABLE", "DC-CABINET")):
            codes.add(code)
    return sorted(codes)


def first_part_number(text: str) -> str:
    candidates = extract_part_numbers(text)
    return candidates[0] if candidates else "MULTI-SKU"


def core_spec(title: str, text: str, family: str) -> str:
    source = f"{title} {text}".upper()
    facts: list[str] = []

    def add(value: str) -> None:
        if value not in facts and len(facts) < 3:
            facts.append(value)

    if "CAT 8" in source or "CAT8" in source:
        add("Category 8")
    elif "CAT 6A" in source or "CAT6A" in source:
        add("Category 6A")
    elif "CAT 6" in source or "CAT6" in source:
        add("Category 6")
    if "2000 MHZ" in source:
        add("2000 MHz")
    elif "500 MHZ" in source:
        add("500 MHz")
    elif "250 MHZ" in source:
        add("250 MHz")
    if "40GBASE" in source or "40GBPS" in source:
        add("40G")
    elif "10GBASE" in source or "10GBPS" in source:
        add("10G")
    if family in ("Data Centre", "Fibre") and ("MPO" in source or "MTP" in source):
        add("MPO/MTP")
    if "144" in source and ("FIBER" in source or "FIBRE" in source or "CORE" in source):
        add("up to 144F")
    for rating in ("IP68", "IP65", "IP55", "IP20"):
        if rating in source:
            add(rating)
            break
    if family in ("Data Centre", "Power") and "SNMP" in source:
        add("SNMP monitoring")
    if "1500 KG" in source:
        add("1500 kg load")
    if family in ("Copper", "Fibre", "Building Systems") and "LSZH" in source:
        add("LSZH")
    if not facts:
        add(family)
        add("Technical specification")
    return " · ".join(facts)


def badge_for(title: str, family: str) -> str:
    upper = title.upper()
    if "INTELLIGENT" in upper or "SMART" in upper or "EPATCH" in upper:
        return "Intelligent infrastructure"
    if family == "Data Centre":
        return "Data Centre"
    if "IP68" in upper or "OUTDOOR" in upper:
        return "Outside plant"
    if family == "Building Systems":
        return "D-SENSE"
    return "Verified datasheet"


def image_for(searchable: str) -> str | None:
    for pattern, relative in IMAGE_RULES:
        if re.search(pattern, searchable, flags=re.I):
            return relative
    return None


def optimize_image(relative: str) -> str:
    source = IMAGE_ROOT / Path(relative)
    slug = re.sub(r"[^a-z0-9]+", "-", source.stem.lower()).strip("-")
    digest = hashlib.sha1(relative.encode("utf-8")).hexdigest()[:7]
    filename = f"{slug[:60]}-{digest}.webp"
    target = OUTPUT_IMAGES / filename
    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        with Image.open(source) as raw:
            # JPEG decoders can reduce very large originals during decode, which
            # avoids allocating the complete print-resolution raster in memory.
            if raw.format == "JPEG":
                raw.draft("RGB", (2400, 1800))
            image = ImageOps.exif_transpose(raw)
            image.thumbnail((1200, 900), Image.Resampling.LANCZOS)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            image.save(target, "WEBP", quality=84, method=6)
    return f"/product-catalog/{filename}"


def path_id(prefix: str, relative: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", relative.lower()).strip("-")[:70]
    digest = hashlib.sha1(relative.encode("utf-8")).hexdigest()[:7]
    return f"{prefix}-{slug}-{digest}"


def humanize_segment(value: str) -> str:
    cleaned = re.sub(r"[_-]+", " ", value)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if cleaned.isupper():
        cleaned = cleaned.title()
    replacements = {
        "Datacenter": "Data Centre",
        "Cat6a": "Cat6A",
        "Cat 6a": "Cat6A",
        "Cat 6": "Cat6",
        "Cat 8": "Cat8",
        "Fttx": "FTTx",
        "Ftth": "FTTH",
        "Pdu": "PDU",
        "Mpo": "MPO",
        "Mtp": "MTP",
        "Sftp": "S/FTP",
        "Utp": "UTP",
        "Uutp": "U/UTP",
        "Lszh": "LSZH",
        "Bms": "BMS",
        "Ems": "EMS",
        "Odf": "ODF",
    }
    for source, target in replacements.items():
        cleaned = re.sub(rf"\b{re.escape(source)}\b", target, cleaned, flags=re.I)
    return cleaned


def search_tokens(value: str) -> set[str]:
    replacements = {
        "FIBER": "FIBRE",
        "DATACENTER": "DATA CENTRE",
        "STANADING": "STANDING",
        "SHEILDED": "SHIELDED",
        "JCKS": "JACKS",
        "CABINETS": "CABINET",
        "ENCLOSURES": "ENCLOSURE",
        "CORDS": "CORD",
        "CABLES": "CABLE",
        "ADAPTERS": "ADAPTER",
    }
    normalized = value.upper()
    for source, target in replacements.items():
        normalized = normalized.replace(source, target)
    ignored = {"DATACOM", "SERIES", "PRODUCT", "PRODUCTS", "IMAGE", "IMAGES", "PHOTO", "EDITED", "WITH", "LOGO", "AND", "THE"}
    return {token for token in re.findall(r"[A-Z0-9]+", normalized) if len(token) > 1 and token not in ignored}


def build_image_hierarchy() -> tuple[list[dict], list[dict], dict[str, str]]:
    image_paths = sorted(
        (path for path in IMAGE_ROOT.rglob("*") if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS),
        key=lambda path: path.as_posix().lower(),
    )
    optimized_by_source = {
        path.relative_to(IMAGE_ROOT).as_posix(): optimize_image(path.relative_to(IMAGE_ROOT).as_posix())
        for path in image_paths
    }

    directories = sorted((path for path in IMAGE_ROOT.rglob("*") if path.is_dir()), key=lambda path: (len(path.parts), path.as_posix().lower()))
    nodes: list[dict] = []
    groups: list[dict] = []
    group_id_by_directory: dict[str, str] = {}
    node_id_by_directory = {
        directory.relative_to(IMAGE_ROOT).as_posix(): path_id("node", directory.relative_to(IMAGE_ROOT).as_posix())
        for directory in directories
    }

    for directory in directories:
        relative = directory.relative_to(IMAGE_ROOT).as_posix()
        segments = relative.split("/")
        direct_images = [
            path
            for path in sorted(directory.iterdir(), key=lambda item: item.name.lower())
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ]
        if direct_images:
            group_id = path_id("group", relative)
            group_id_by_directory[relative] = group_id
            image_records = []
            for source in direct_images:
                source_relative = source.relative_to(IMAGE_ROOT).as_posix()
                image_records.append(
                    {
                        "src": optimized_by_source[source_relative],
                        "name": humanize_segment(source.stem),
                        "sourceName": source.name,
                    }
                )
            groups.append(
                {
                    "id": group_id,
                    "name": humanize_segment(segments[-1]),
                    "sourceName": segments[-1],
                    "path": relative,
                    "pathSegments": segments,
                    "breadcrumbs": [humanize_segment(segment) for segment in segments],
                    "topLevel": segments[0],
                    "depth": len(segments),
                    "images": image_records,
                    "preview": image_records[0]["src"],
                    "searchText": " ".join([relative, *[item["sourceName"] for item in image_records]]),
                    "datasheets": [],
                    "skuCodes": [],
                }
            )

    group_by_path = {group["path"]: group for group in groups}
    for directory in directories:
        relative = directory.relative_to(IMAGE_ROOT).as_posix()
        segments = relative.split("/")
        parent_relative = "/".join(segments[:-1]) if len(segments) > 1 else None
        child_paths = [
            child.relative_to(IMAGE_ROOT).as_posix()
            for child in sorted(directory.iterdir(), key=lambda item: item.name.lower())
            if child.is_dir()
        ]
        descendant_images = [
            path for path in directory.rglob("*") if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ]
        descendant_groups = [group for group_path, group in group_by_path.items() if group_path == relative or group_path.startswith(f"{relative}/")]
        preview = None
        if descendant_images:
            preview_source = sorted(descendant_images, key=lambda path: path.as_posix().lower())[0].relative_to(IMAGE_ROOT).as_posix()
            preview = optimized_by_source[preview_source]
        nodes.append(
            {
                "id": node_id_by_directory[relative],
                "name": humanize_segment(segments[-1]),
                "sourceName": segments[-1],
                "path": relative,
                "pathSegments": segments,
                "breadcrumbs": [humanize_segment(segment) for segment in segments],
                "depth": len(segments),
                "parentId": node_id_by_directory.get(parent_relative) if parent_relative else None,
                "childIds": [node_id_by_directory[path] for path in child_paths],
                "directProductGroupId": group_id_by_directory.get(relative),
                "directImageCount": len(group_by_path.get(relative, {}).get("images", [])),
                "totalImageCount": len(descendant_images),
                "productGroupCount": len(descendant_groups),
                "preview": preview,
            }
        )
    return nodes, groups, group_id_by_directory


def best_group_for_document(product: dict, groups: list[dict], image_source: str | None, group_id_by_directory: dict[str, str]) -> str | None:
    if image_source:
        image_parent = Path(image_source).parent.as_posix()
        if image_parent in group_id_by_directory:
            return group_id_by_directory[image_parent]
    document_tokens = search_tokens(f"{product['name']} {product['sourceFile']}")
    best_id = None
    best_score = 0.0
    for group in groups:
        group_tokens = search_tokens(f"{group['path']} {group['searchText']}")
        if not document_tokens or not group_tokens:
            continue
        overlap = document_tokens & group_tokens
        score = len(overlap) / max(1, min(len(document_tokens), len(group_tokens)))
        if score > best_score:
            best_id = group["id"]
            best_score = score
    return best_id if best_score >= 0.42 else None


def main() -> None:
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)
    hierarchy_nodes, product_groups, group_id_by_directory = build_image_hierarchy()
    groups_by_id = {group["id"]: group for group in product_groups}

    grouped: dict[str, list[Path]] = {}
    for path in SPEC_ROOT.rglob("*.pdf"):
        grouped.setdefault(file_hash(path), []).append(path)

    selected = [min(paths, key=preferred_source) for paths in grouped.values()]
    selected.sort(key=lambda item: item.relative_to(SPEC_ROOT).as_posix().upper())

    products = []
    used_ids: set[str] = set()
    for path in selected:
        relative = path.relative_to(SPEC_ROOT).as_posix()
        title = clean_title(path)
        family = classify(relative, title)
        text, pages = extract_text(path)
        part_numbers = extract_part_numbers(text)
        code = part_numbers[0] if part_numbers else "MULTI-SKU"
        base_id = re.sub(r"[^a-z0-9]+", "-", f"{code}-{title}".lower()).strip("-")[:72]
        item_id = base_id
        suffix = 2
        while item_id in used_ids:
            item_id = f"{base_id}-{suffix}"
            suffix += 1
        used_ids.add(item_id)
        path_parts = relative.split("/")
        subcategory = path_parts[-2] if len(path_parts) > 1 else family
        searchable = f"{relative} {title} {text[:5000]}"
        image_source = image_for(title) or image_for(relative)
        provisional = {
            "id": item_id,
            "code": code,
            "name": title,
            "family": family,
            "subcategory": subcategory.title(),
            "spec": core_spec(title, text, family),
            "badge": badge_for(title, family),
            "image": optimize_image(image_source) if image_source else None,
            "pages": pages,
            "sourceFile": relative,
            "searchText": re.sub(r"\s+", " ", searchable[:7000]),
            "partNumbers": part_numbers,
        }
        provisional["groupId"] = best_group_for_document(provisional, product_groups, image_source, group_id_by_directory)
        if not provisional["image"] and provisional["groupId"]:
            provisional["image"] = groups_by_id[provisional["groupId"]]["preview"]
        products.append(provisional)

    for product in products:
        product["featured"] = False
    featured_patterns = {
        "Data Centre": [r"QNET HD6 SERIES MPO PANEL", r"DATA CENTRE SERVER CABINET"],
        "Power": [r"^INTELLIGENT POWER DISTRIBUTION", r"HORIZONTAL POWER DISTRIBUTION"],
        "Copper": [r"CAT8 S/FTP 23", r"CAT 6A S/FTP 23"],
        "Fibre": [r"144 PORT SC", r"SINGLE MODE LSZH DROP CABLE FOR FTTH$"],
        "Cabinets": [r"MULTI CHAMBER OUTDOOR CABINET", r"FLOOR STANDING CABINET"],
        "Building Systems": [r"D-SENSE SERIES KNX", r"D-SENSE SERIES RS485"],
    }
    for family, patterns in featured_patterns.items():
        for pattern in patterns:
            match = next(
                (
                    item
                    for item in products
                    if item["family"] == family
                    and item["image"]
                    and re.search(pattern, item["name"], flags=re.I)
                ),
                None,
            )
            if match:
                match["featured"] = True

    documents_by_code: dict[str, list[dict]] = defaultdict(list)
    for product in products:
        for part_number in product["partNumbers"]:
            documents_by_code[part_number].append(product)

    sku_products = []
    for part_number, documents in sorted(documents_by_code.items()):
        primary = documents[0]
        group = groups_by_id.get(primary.get("groupId"))
        sku_products.append(
            {
                "id": path_id("sku", part_number),
                "code": part_number,
                "name": primary["name"],
                "family": primary["family"],
                "subcategory": primary["subcategory"],
                "spec": primary["spec"],
                "badge": primary["badge"],
                "image": primary["image"] or (group["preview"] if group else None),
                "pages": primary["pages"],
                "featured": primary["featured"],
                "datasheetId": primary["id"],
                "datasheetIds": [document["id"] for document in documents],
                "groupId": primary.get("groupId"),
                "breadcrumb": " / ".join(group["breadcrumbs"]) if group else primary["subcategory"],
                "searchText": " ".join(
                    [
                        part_number,
                        primary["name"],
                        primary["family"],
                        primary["subcategory"],
                        primary["spec"],
                        group["searchText"] if group else "",
                    ]
                ),
            }
        )

    for group in product_groups:
        group_documents = [product for product in products if product.get("groupId") == group["id"]]
        group["datasheets"] = [
            {
                "id": product["id"],
                "name": product["name"],
                "spec": product["spec"],
                "pages": product["pages"],
            }
            for product in group_documents
        ]
        group["skuCodes"] = sorted({code for product in group_documents for code in product["partNumbers"]})

    public_keys = {
        "id",
        "code",
        "name",
        "family",
        "subcategory",
        "spec",
        "badge",
        "image",
        "pages",
        "searchText",
        "featured",
        "partNumbers",
        "groupId",
    }
    public_products = [{key: value for key, value in item.items() if key in public_keys} for item in products]
    featured_products = [
        {key: value for key, value in item.items() if key in public_keys and key != "searchText"}
        for item in products
        if item["featured"]
    ]
    OUTPUT_JSON.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_PUBLIC_JSON.write_text(json.dumps(public_products, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_FEATURED_JSON.write_text(json.dumps(featured_products, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_SKU_JSON.write_text(json.dumps(sku_products, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_HIERARCHY_JSON.write_text(json.dumps(hierarchy_nodes, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_GROUPS_JSON.write_text(json.dumps(product_groups, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Indexed {len(products)} unique specification sheets from {sum(len(v) for v in grouped.values())} PDFs")
    print(f"Indexed {len(sku_products)} individually searchable ordering codes")
    print(f"Preserved {len(hierarchy_nodes)} nested directories and {len(product_groups)} image-backed product groups")
    print(f"Optimized {sum(len(group['images']) for group in product_groups)} supplied product images")


if __name__ == "__main__":
    main()
