Install ArgoCD

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Ignore Cilium resources by modifying the argocd-cm configmap

```
data:
  resource.exclusions: |
   - apiGroups:
       - cilium.io
     kinds:
       - CiliumIdentity
     clusters:
       - "*"
```
