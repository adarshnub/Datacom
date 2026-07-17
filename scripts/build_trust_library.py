"""Build the public trust-library index from supplied certificates and test reports."""

from __future__ import annotations

import hashlib
import json
import re
from datetime import date
from pathlib import Path

import fitz
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CERT_ROOT = ROOT / "client-docs" / "CERTIFICATES -TEST REPORTS" / "CERTIFICATES"
OUTPUT_JSON = ROOT / "app" / "data" / "certificates.json"
OUTPUT_PUBLIC_JSON = ROOT / "app" / "data" / "certificates-public.json"
OUTPUT_VERIFICATIONS = ROOT / "app" / "data" / "product-verifications.json"
OUTPUT_IMAGES = ROOT / "public" / "trust-library"
TODAY = date.today()


RECORDS = {
    "FORCE/DATACOM CAT6A FFTP-FORCE (EC VERIFIED) ISO IEC COMPLIANCE CERTIFICATE.pdf": {
        "title": "Category 6A F/FTP Cable Compliance Statement",
        "issuer": "FORCE Technology",
        "issuerCountry": "Denmark",
        "documentType": "EC VERIFIED compliance statement",
        "certificateNo": "2025-360",
        "scope": "Category 6A screened F/FTP LSZH cable characterized to 500 MHz",
        "standards": ["ISO/IEC 11801-1", "IEC 61156-5", "EN 50173-1", "TIA-568.2-E"],
        "partNumbers": ["DC-CBL-C6A-FF-LSZH"],
        "issued": "2025-06-26",
        "validUntil": "2026-05-01",
        "language": "English",
        "note": "Archived: the compliance statement passed its stated validity date on 1 May 2026.",
    },
    "GHMT/CAT6 SOLUTION.pdf": {
        "title": "Category 6 Class E Channel Type Approval",
        "issuer": "GHMT AG",
        "issuerCountry": "Germany",
        "documentType": "GHMT type approval",
        "certificateNo": "P000582196-02-01-A",
        "scope": "Two-connector Category 6 copper channel including cable, jacks and patch cords",
        "standards": ["ISO/IEC 11801-1", "DIN EN 50173-1", "Class E"],
        "partNumbers": [
            "DC-CBL-C64P-LSZH",
            "DC-CBL-C64P-PVC",
            "DC-MJKJ-C6-BK",
            "DC-MJRJ-C6-BK",
            "DC-PC-RJC6-01M-LSZH-XX",
            "DC-PC-RJC6-02M-LSZH-XX",
            "DC-PC-RJC6-03M-LSZH-XX",
            "DC-PC-RJC6-05M-LSZH-XX",
        ],
        "issued": "2026-04-14",
        "validUntil": "2028-04-14",
        "language": "English",
        "note": "Certificate references the associated comprehensive test report and is valid for 24 months after testing.",
    },
    "GHMT/CAT6A FFTP SOLUTION.pdf": {
        "title": "Category 6A F/FTP Class EA Channel Type Approval",
        "issuer": "GHMT AG",
        "issuerCountry": "Germany",
        "documentType": "GHMT type approval",
        "certificateNo": "P000582196-01-01-A",
        "scope": "Two-connector Category 6A shielded copper channel including cable, jack and patch cords",
        "standards": ["ISO/IEC 11801-1", "DIN EN 50173-1", "Class EA"],
        "partNumbers": [
            "DC-CBL-C6A-FF-LSZH",
            "DC-MJRJ-C6A-SH",
            "DC-PC-RJC6A-SF-01M-LSZH-WT",
            "DC-PC-RJC6A-SF-02M-LSZH-WT",
            "DC-PC-RJC6A-SF-03M-LSZH-WT",
            "DC-PC-RJC6A-SF-05M-LSZH-WT",
        ],
        "issued": "2026-04-14",
        "validUntil": "2028-04-14",
        "language": "English",
        "note": "Certificate references the associated comprehensive test report and is valid for 24 months after testing.",
    },
    "GHMT/DATACOM CAT6A UTP GHMT TEST REPORT-ENGLISH.pdf": {
        "title": "Category 6A U/UTP Class EA Channel Type Approval",
        "issuer": "GHMT AG",
        "issuerCountry": "Germany",
        "documentType": "GHMT type approval",
        "certificateNo": "c8650b-24",
        "scope": "Two-connector Category 6A unshielded copper channel including cable, jacks and patch cords",
        "standards": ["ISO/IEC 11801-1", "DIN EN 50173-1", "Class EA"],
        "partNumbers": [
            "DC-CBL-C6A-UT-LSZH",
            "DC-MJKJ-C6A-BK",
            "DC-MJRJ-C6A-BK",
            "DC-PC-RJC6A-UT-01M-LSZH-XX",
            "DC-PC-RJC6A-UT-02M-LSZH-XX",
            "DC-PC-RJC6A-UT-03M-LSZH-XX",
            "DC-PC-RJC6A-UT-05M-LSZH-XX",
        ],
        "issued": "2024-06-03",
        "validUntil": "2026-06-03",
        "language": "English",
        "note": "Archived: the approval's stated 24-month validity period ended on 3 June 2026.",
    },
    "GHMT/SHIELDED SOLUTION.pdf": {
        "title": "Category 6A F/FTP Class EA Channel Type Approval - German",
        "issuer": "GHMT AG",
        "issuerCountry": "Germany",
        "documentType": "GHMT type approval",
        "certificateNo": "P000582196-01-01-A",
        "scope": "German-language issue of the Category 6A shielded two-connector channel approval",
        "standards": ["ISO/IEC 11801-1", "DIN EN 50173-1", "Class EA"],
        "partNumbers": [
            "DC-CBL-C6A-FF-LSZH",
            "DC-MJRJ-C6A-SH",
            "DC-PC-RJC6A-SF-01M-LSZH-WT",
            "DC-PC-RJC6A-SF-02M-LSZH-WT",
            "DC-PC-RJC6A-SF-03M-LSZH-WT",
            "DC-PC-RJC6A-SF-05M-LSZH-WT",
        ],
        "issued": "2026-04-14",
        "validUntil": "2028-04-14",
        "language": "German",
        "note": "German-language counterpart of certificate P000582196-01-01-A.",
    },
    "INTERTEK/DATACOM Cat6 Cable C6LSZH-105830469CRT-001b  INTERTEK.pdf": {
        "title": "Category 6 U/UTP LSZH Cable Certificate of Conformance",
        "issuer": "Intertek",
        "issuerCountry": "United States",
        "documentType": "ETL Verified certificate of conformance",
        "certificateNo": "105830469CRT-001b",
        "scope": "Category 6, 23 AWG, four-pair U/UTP LSZH horizontal cable",
        "standards": ["ANSI/TIA-568.2-D", "Category 6"],
        "partNumbers": ["DC-CBL-C64P-LSZH"],
        "issued": "2024-06-15",
        "validUntil": None,
        "language": "English",
        "note": "Certificate states that continuing compliance is monitored through production testing, inspections and random sample testing.",
    },
    "INTERTEK/DATACOM Cat6A SFTP LSZH CoC 106300763CRT-001.pdf": {
        "title": "Category 6A S/FTP LSZH Cable Certificate of Conformance",
        "issuer": "Intertek",
        "issuerCountry": "United States",
        "documentType": "ETL Verified certificate of conformance",
        "certificateNo": "106300763CRT-001",
        "scope": "Category 6A, 23 AWG, four-pair S/FTP LSZH horizontal cable",
        "standards": ["ANSI/TIA-568.2-E", "EN 50173-1", "ISO/IEC 11801-1", "Category 6A"],
        "partNumbers": ["DC-CBL-C6A-SF-LSZH"],
        "issued": "2025-09-24",
        "validUntil": None,
        "language": "English",
        "note": "Certificate states that continuing compliance is monitored through production testing, inspections and random sample testing.",
    },
    "INTERTEK/DATACOM Cat6a UTP CoC 105830469CRT-001c- INTERTEK.pdf": {
        "title": "Category 6A U/UTP LSZH Cable Certificate of Conformance",
        "issuer": "Intertek",
        "issuerCountry": "United States",
        "documentType": "ETL Verified certificate of conformance",
        "certificateNo": "105830469CRT-001c",
        "scope": "Category 6A, 23 AWG, four-pair U/UTP LSZH horizontal cable",
        "standards": ["ANSI/TIA-568.2-D", "Category 6A"],
        "partNumbers": ["DC-CBL-C6A-UT-LSZH", "DC-CBL-C6A-UTP-LSZH"],
        "issued": "2024-06-15",
        "validUntil": None,
        "language": "English",
        "note": "Certificate states that continuing compliance is monitored through production testing, inspections and random sample testing.",
    },
}


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def status_for(valid_until: str | None) -> str:
    if valid_until and date.fromisoformat(valid_until) < TODAY:
        return "expired"
    if valid_until:
        return "current"
    return "monitored"


def render_preview(source: Path, certificate_id: str) -> str:
    target = OUTPUT_IMAGES / f"{certificate_id}.webp"
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return f"/trust-library/{target.name}"
    document = fitz.open(source)
    page = document[0]
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
    image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
    image.thumbnail((900, 1200), Image.Resampling.LANCZOS)
    image.save(target, "WEBP", quality=82, method=6)
    document.close()
    return f"/trust-library/{target.name}"


def main() -> None:
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)
    actual_files = {path.relative_to(CERT_ROOT).as_posix() for path in CERT_ROOT.rglob("*.pdf")}
    configured_files = set(RECORDS)
    if actual_files != configured_files:
        missing = configured_files - actual_files
        unconfigured = actual_files - configured_files
        raise RuntimeError(f"Trust-library configuration mismatch. Missing={missing}; unconfigured={unconfigured}")

    records = []
    for relative, metadata in RECORDS.items():
        source = CERT_ROOT / Path(relative)
        certificate_id = slugify(f"{metadata['issuer']}-{metadata['certificateNo']}-{metadata['language']}")
        record = {
            "id": certificate_id,
            **metadata,
            "status": status_for(metadata["validUntil"]),
            "sourceFile": relative,
            "fileHash": sha256(source),
            "preview": render_preview(source, certificate_id),
        }
        records.append(record)

    status_order = {"current": 0, "monitored": 1, "expired": 2}
    records.sort(key=lambda item: (status_order[item["status"]], item["issuer"], item["title"]))
    public_records = [{key: value for key, value in item.items() if key not in {"sourceFile", "fileHash"}} for item in records]
    verification_index: dict[str, list[str]] = {}
    for record in records:
        if record["status"] == "expired":
            continue
        for part_number in record["partNumbers"]:
            verification_index.setdefault(part_number, []).append(record["id"])

    OUTPUT_JSON.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_PUBLIC_JSON.write_text(json.dumps(public_records, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_VERIFICATIONS.write_text(json.dumps(verification_index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Indexed {len(records)} certificates: " + ", ".join(f"{status}={sum(1 for item in records if item['status'] == status)}" for status in status_order))
    print(f"Mapped active evidence to {len(verification_index)} part numbers")


if __name__ == "__main__":
    main()
