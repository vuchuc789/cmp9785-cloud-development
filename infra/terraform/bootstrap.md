Bootstrap Terraform with the following commands:

```
terraform apply -target=module.addr -target=module.ssl -target=module.cdn
terraform apply -target=module.gke
terraform apply -target=module.kubernetes.helm_release.argocd
terraform apply
```

Get the new cluster credentials for accessing:

```
gcloud container clusters get-credentials cmp9785-cluster --zone=europe-west2-b
```
