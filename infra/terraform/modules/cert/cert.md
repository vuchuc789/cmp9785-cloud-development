Since certificates signed by Google often take time to set up, you can speed up repeated `terraform apply` runs by removing the certificate resources before destroying the infrastructure and importing them again before applying. Furthermore, Google Certificate Manager offers the first 100 domains for free, so you don’t need to worry about the cost.

```
terraform import module.google.google_certificate_manager_dns_authorization.default projects/cmp9785/locations/europe-north2/dnsAuthorizations/cmp9785-dnsauth

terraform import module.google.google_certificate_manager_certificate.root_cert projects/cmp9785/locations/europe-north2/certificates/cmp9785-rootcert
```
