---
title: Trusting custom Certification Authorities system-wide on Ubuntu
createtoc: false
---

To trust custom Certification Authorities on Ubuntu you must have the
certificates available first. Note that certificates:

* must be in **PEM format**
* must have **Unix line returns** (and not DOS/Windows)
* must be in a file ending with the `.crt` extension
* must **not have spaces in its name**

Your certificate is in PEM format if it is a text file containing the
following section:

```
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```

If it is a binary file, it is probably in DER format. Convert it to
PEM with:

```bash
openssl x509 -inform DER -in CertificateFile.der > CertificateFile.crt
```

Convert line returns from DOS to Unix:

```bash
dos2unix CertificateFile.crt
```

If you do not have `dos2unix` install it first:

```bash
aptitude install dos2unix
```

Copy the `.crt` file(s) to the custom certificates directory (you must
be root):

```bash
sudo cp CertificateFile.crt /usr/local/share/ca-certificates/
```

Now inform the system that certificates to trust have changed. Run:

```bash
sudo dpkg-reconfigure ca-certificates
```

Press **Yes** at the interactive prompt, and proceed. Your
certificates are not in this list. Do not touch it, just continue.

Now run the update command:

```console
$> sudo update-ca-certificates
Updating certificates in /etc/ssl/certs... 2 added, 2 removed; done.
Running hooks in /etc/ca-certificates/update.d....done.
```

To test if it works, if you have a HTTPS server available running with
a certificate issued by one of the CAs you have just added, simply do:

```bash
curl https://my-server.domain.asd/ | wc
```

If `curl` does not complain about certificate validity, you are set.
