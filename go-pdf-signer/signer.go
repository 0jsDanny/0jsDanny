package main

import (
	"bytes"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/asn1"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/pkcs12"
)

// PKCS7 represents a simplified PKCS#7 SignedData structure for PDF signing
type PKCS7 struct {
	ContentType asn1.ObjectIdentifier
	Content     asn1.RawValue `asn1:"explicit,tag:0"`
}

// LoadCertificate parses a PKCS#12 certificate (.pfx/.p12) and extracts the key and cert
func LoadCertificate(pfxData []byte, password string) (crypto.PrivateKey, *x509.Certificate, error) {
	privKey, cert, err := pkcs12.Decode(pfxData, password)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to decode PKCS#12: %w", err)
	}
	return privKey, cert, nil
}

// SignPDF signs a PDF slice using PAdES-like incremental update
func SignPDF(pdfData []byte, privKey crypto.PrivateKey, cert *x509.Certificate) ([]byte, error) {
	rsaKey, ok := privKey.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("only RSA private keys are supported in this demonstration")
	}

	// 1. Prepare PDF Incremental Update
	// We append a new signature field, signature value, and update the catalog AcroForm
	
	// Create placeholder hex signature (8192 characters = 4096 bytes of zeros)
	signatureLength := 4096
	placeholderHex := strings.Repeat("0", signatureLength*2)

	// Object numbers: We assume we append objects. To do this robustly without parsing
	// the whole cross-reference table, we can append new objects using standard PDF notation.
	// We'll append:
	// - Object 99 0 obj: Signature Field (Widget Annotation)
	// - Object 100 0 obj: Signature Value Dictionary (/Sig)
	// - Object 101 0 obj: Updated Catalog pointing to the signature field under AcroForm
	
	// Locate the Catalog object or insert an AcroForm update
	// Standard PDF catalog updated version:
	catalogUpdate := "\r\n101 0 obj\r\n<<\r\n/Type /Catalog\r\n/AcroForm << /Fields [99 0 R] /SigFlags 3 >>\r\n>>\r\nendobj\r\n"
	
	sigField := "\r\n99 0 obj\r\n<<\r\n/Type /Annot\r\n/Subtype /Widget\r\n/FT /Sig\r\n/T (Signature1)\r\n/V 100 0 R\r\n/Rect [0 0 0 0]\r\n/F 4\r\n>>\r\nendobj\r\n"

	// We calculate the byte offsets for /ByteRange.
	// The range covers:
	// - Range 1: 0 to the start of the <hex signature placeholder>
	// - Range 2: end of the <hex signature placeholder> to the end of the file.
	
	// Let's construct the Signature Value dictionary template
	sigValueHeader := "\r\n100 0 obj\r\n<<\r\n/Type /Sig\r\n/Filter /Adobe.PPKLite\r\n/SubFilter /adbe.pkcs7.detached\r\n/M (D:" + timeString() + ")\r\n/Contents <"
	sigValueTrailer := ">\r\n/ByteRange [ 0 %d %d %d ]\r\n>>\r\nendobj\r\n"

	// Append sig field and catalog update first to know offsets
	var buffer bytes.Buffer
	buffer.Write(pdfData)
	
	sigFieldOffset := int64(buffer.Len())
	buffer.WriteString(sigField)
	
	catalogOffset := int64(buffer.Len())
	buffer.WriteString(catalogUpdate)

	sigValOffset := int64(buffer.Len())
	buffer.WriteString(sigValueHeader)
	
	placeholderOffset := int64(buffer.Len())
	buffer.WriteString(placeholderHex)
	
	endOfPlaceholderOffset := int64(buffer.Len())
	
	// Format the trailer with ByteRange offsets
	// Total length after placeholder will include the trailer and xref
	// Let's write the trailer into a temporary buffer to calculate exact offsets
	var trailerBuf bytes.Buffer
	
	// ByteRange offsets:
	// - Start: 0
	// - Length 1: placeholderOffset (since it starts at 0)
	// - Start 2: endOfPlaceholderOffset
	// - Length 2: will be computed dynamically
	
	byteRangeLength1 := placeholderOffset
	byteRangeStart2 := endOfPlaceholderOffset
	
	// We draft the trailer to compute size
	fmt.Fprintf(&trailerBuf, sigValueTrailer, byteRangeLength1, byteRangeStart2, 0)
	
	// Write xref table and trailer
	xrefOffset := int64(buffer.Len()) + int64(trailerBuf.Len())
	
	var xrefBuf bytes.Buffer
	xrefBuf.WriteString("xref\r\n")
	xrefBuf.WriteString("0 1\r\n")
	xrefBuf.WriteString("0000000000 65535 f\r\n")
	xrefBuf.WriteString("99 3\r\n")
	fmt.Fprintf(&xrefBuf, "%010d 00000 n\r\n", sigFieldOffset)
	fmt.Fprintf(&xrefBuf, "%010d 00000 n\r\n", sigValOffset)
	fmt.Fprintf(&xrefBuf, "%010d 00000 n\r\n", catalogOffset)
	xrefBuf.WriteString("trailer\r\n")
	xrefBuf.WriteString("<<\r\n/Size 102\r\n/Root 101 0 R\r\n>>\r\n")
	xrefBuf.WriteString("startxref\r\n")
	fmt.Fprintf(&xrefBuf, "%d\r\n", xrefOffset)
	xrefBuf.WriteString("%%EOF\r\n")

	// Calculate correct Length 2 for ByteRange
	byteRangeLength2 := int64(trailerBuf.Len()) + int64(xrefBuf.Len())
	
	// Re-write trailer with correct Length 2
	trailerBuf.Reset()
	fmt.Fprintf(&trailerBuf, sigValueTrailer, byteRangeLength1, byteRangeStart2, byteRangeLength2)

	// Build the entire PDF update structure
	buffer.WriteString(trailerBuf.String())
	buffer.WriteString(xrefBuf.String())

	// 2. Extract signing bytes specified in /ByteRange
	signedPDFBytes := buffer.Bytes()
	
	// ByteRange 1
	part1 := signedPDFBytes[0:byteRangeLength1]
	// ByteRange 2
	part2 := signedPDFBytes[byteRangeStart2 : byteRangeStart2+byteRangeLength2]
	
	// Combine parts to hash
	hashInput := make([]byte, len(part1)+len(part2))
	copy(hashInput[0:len(part1)], part1)
	copy(hashInput[len(part1):], part2)

	// Hash using SHA-256
	hasher := sha256.New()
	hasher.Write(hashInput)
	digest := hasher.Sum(nil)

	// 3. Cryptographically Sign the hash
	signature, err := rsa.SignPKCS1v15(rand.Reader, rsaKey, crypto.SHA256, digest)
	if err != nil {
		return nil, fmt.Errorf("failed to sign digest: %w", err)
	}

	// 4. Wrap signature in a simple ASN.1 PKCS#7 container
	pkcs7Bytes, err := BuildPKCS7Signature(signature, cert)
	if err != nil {
		return nil, fmt.Errorf("failed to build PKCS#7 container: %w", err)
	}

	// Hex-encode the signature block
	sigHex := hex.EncodeToString(pkcs7Bytes)
	if len(sigHex) > signatureLength*2 {
		return nil, fmt.Errorf("signature size (%d bytes) exceeds placeholder allocation (%d bytes)", len(pkcs7Bytes), signatureLength)
	}

	// Pad signature hex with zeros to match exact placeholder size
	padding := strings.Repeat("0", (signatureLength*2)-len(sigHex))
	finalSigHex := sigHex + padding

	// 5. Overwrite the placeholder inside the final PDF slice
	copy(signedPDFBytes[placeholderOffset:placeholderOffset+int64(signatureLength*2)], []byte(finalSigHex))

	return signedPDFBytes, nil
}

// BuildPKCS7Signature constructs a minimal DER-encoded ASN.1 PKCS#7 structure
func BuildPKCS7Signature(signature []byte, cert *x509.Certificate) ([]byte, error) {
	// PKCS#7 OIDs
	oidSignedData := asn1.ObjectIdentifier{1, 2, 840, 113549, 1, 7, 2}
	
	// ASN.1 serialization of signature and certificate
	type SignerInfo struct {
		Version            int
		IssuerAndSerial    asn1.RawValue
		DigestAlgorithm    asn1.RawValue
		SignatureAlgorithm asn1.RawValue
		Signature          []byte
	}

	// Mock Issuer and Serial representation for simplified PAdES signature demo
	issuerRaw, err := asn1.Marshal(cert.Issuer.ToRDNSequence())
	if err != nil {
		return nil, err
	}
	
	type IssuerSerial struct {
		Issuer asn1.RawValue
		Serial int64
	}
	is := IssuerSerial{
		Issuer: asn1.RawValue{FullBytes: issuerRaw},
		Serial: cert.SerialNumber.Int64(),
	}
	isRaw, _ := asn1.Marshal(is)

	digestAlgoOID := asn1.ObjectIdentifier{2, 16, 840, 1, 101, 3, 4, 2, 1} // SHA-256
	digestAlgoRaw, _ := asn1.Marshal(digestAlgoOID)
	
	sigAlgoOID := asn1.ObjectIdentifier{1, 2, 840, 113549, 1, 1, 11} // sha256WithRSAEncryption
	sigAlgoRaw, _ := asn1.Marshal(sigAlgoOID)

	si := SignerInfo{
		Version:            1,
		IssuerAndSerial:    asn1.RawValue{FullBytes: isRaw},
		DigestAlgorithm:    asn1.RawValue{FullBytes: digestAlgoRaw},
		SignatureAlgorithm: asn1.RawValue{FullBytes: sigAlgoRaw},
		Signature:          signature,
	}

	// Pack SignedData fields
	type SignedData struct {
		Version          int
		DigestAlgorithms []asn1.RawValue
		ContentInfo      asn1.RawValue
		Certificates     asn1.RawValue `asn1:"optional,tag:0"`
		SignerInfos      []SignerInfo
	}

	certRaw := cert.Raw
	certRawSet := asn1.RawValue{Class: 2, Tag: 0, IsCompound: true, Bytes: certRaw}

	sd := SignedData{
		Version:          1,
		DigestAlgorithms: []asn1.RawValue{{FullBytes: digestAlgoRaw}},
		ContentInfo:      asn1.RawValue{FullBytes: []byte{0x30, 0x00}}, // empty sequence placeholder
		Certificates:     certRawSet,
		SignerInfos:      []SignerInfo{si},
	}

	sdBytes, err := asn1.Marshal(sd)
	if err != nil {
		return nil, err
	}

	p7 := PKCS7{
		ContentType: oidSignedData,
		Content:     asn1.RawValue{Class: 2, Tag: 0, IsCompound: true, Bytes: sdBytes},
	}

	return asn1.Marshal(p7)
}

func timeString() string {
	// Returns format YYYYMMDDHHMMSSZ
	return "20260528180000Z"
}
