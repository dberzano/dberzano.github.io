---
title: "ALICE AliEn certificate installation"
layout: tweet
---


This short howto explains how to obtain and prepare your certificates
to use AliEn, _i.e._ the ALICE Grid services.


Obtain a digital certificate
----------------------------

A digital certificate will identify you univocally when you use AliEn
services. There is no general procedure for obtaining a certificate:
you will have to ask your organization or institute to issue one for
you.

A certificate request procedure usually involves using your web
browser: when the certificate is obtained, both your certificate and
your private key (generated locally) will be stored inside your
browser's keychain.

> Some browsers on some operating systems might store the certificate
> in a system-wide keychain: for example, this is the case for Safari
> or Chrome on macOS.


### Obtain a certificate from CERN

In case you don't know who to ask for getting a digital certificate, or in case
the procedure at your institute is too lengthy and you can't afford waiting,
you can simply ask CERN to issue you a Grid certificate. The certificate will
be issued automatically and instantly if you have a CERN account.

* [Generate a new CERN Grid User
   certificate](https://ca.cern.ch/ca/user/Request.aspx?template=EE2User)

If the link above does not function, go to the [CERN certification
authority](https://ca.cern.ch/) web page and look for "New Grid user
certificate".

From that point on, follow the on-screen instructions until you get your
certificate.


Register your certificate to ALICE
----------------------------------

In order to use the AliEn services for ALICE, you have to register
your newly obtained certificate to the ALICE Virtual Organization.

In practice you will need to go to
[VOMS-Admin](https://voms2.cern.ch:8443/voms/alice) and follow the guided
procedure.

> Note: you might be asked to select a certificate to authenticate to the page:
> be sure you are selecting the correct one.


Export the certificate to files
-------------------------------

When the registration to the VO is successful, you will receive an
email informing you. The registration procedure does not involve any
modification or re-download of your current certificate.

This means that you can export the certificate to files even if you
are not yet registered to the ALICE VO.

The exact procedure depends on your browser and operating system.


### Firefox users

On Firefox, for instance, go to:

    Preferences → Advanced → Encryption → Show certificates

Select your certificate under the **Your certificates** tab, then
export it by means of the **Save...** button. You will be asked for a
file name and an export password to protect the exported content.

The output file will be a PKCS12 file (usually its name ends with
the extension `.p12`) that contains both the private key and the
certificate.


### macOS users

If you use Chrome or Safari on macOS, certificates are saved in the system's
keychain. Open it (there is an app called **Keychain**), then move to the
**Category** panel on the left and select **My certificates** from the list.
Make sure the **login** keychain is selected.

Click on the certificate you want to use, then from the menu:

    File → Export Items

As for Firefox, the output file will be a PKCS12 file with both the private key
and your certificate inside.


Make your certificate usable by AliEn
-------------------------------------

Suppose you exported your certificate and key to `~/certkey.p12`. Open
a terminal, then create the certificate directory and move to it:

```sh
mkdir -p ~/.globus
cd ~/.globus
```

Now, export the certificate: you will be asked for the import password
you have typed in the previous step:

```sh
openssl pkcs12 -clcerts -nokeys -in ~/certkey.p12 -out usercert.pem
```

The input file contains both the private key and the certificate and
we have just extracted the latter. To extract the private key:

```sh
openssl pkcs12 -nocerts -in ~/certkey.p12 -out userkey.pem
chmod 0400 userkey.pem
```

When exporting the key, you are asked for two passwords:

*  the import password you have entered when exporting the `.p12` file
   from the browser;
*  another password that will protect your new private key file.

The latter will be prompted to you whenever you will connect to the
AliEn services.

**Important:** the private key is and must stay, as the name suggests,
private:

*   **don't** ever give or send your key to anyone;
*   protect your key with a **very strong passphrase**.


Use AliEn services
------------------

You may want to test the certificate by running:

```sh
alien-token-init <your_alien_username>
```

If something goes wrong, try to remove any other traces left around
by older certificates by first running:

```sh
alien-token-destroy
```
