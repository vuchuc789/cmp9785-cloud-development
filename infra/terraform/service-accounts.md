Generate a service account key (`sa-private-key.json`) using commands below:

```
gcloud services enable container.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com

gcloud iam service-accounts create gke-admin \
  --description="Provision Kubernetes Resources" \
  --display-name="GKE Admin"

gcloud projects add-iam-policy-binding cmp9785 \
  --member="serviceAccount:gke-admin@cmp9785.iam.gserviceaccount.com" \
  --role="roles/container.admin"

gcloud projects add-iam-policy-binding cmp9785 \
  --member="serviceAccount:gke-admin@cmp9785.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding cmp9785 \
  --member="serviceAccount:gke-admin@cmp9785.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding cmp9785 \
  --member="serviceAccount:gke-admin@cmp9785.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountAdmin"

gcloud projects add-iam-policy-binding cmp9785 \
  --member="serviceAccount:gke-admin@cmp9785.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding cmp9785 \
  --member="serviceAccount:gke-admin@cmp9785.iam.gserviceaccount.com" \
  --role="roles/certificatemanager.editor"

gcloud iam service-accounts keys create sa-private-key.json \
    --iam-account=gke-admin@cmp9785.iam.gserviceaccount.com
```

Use the new service account key in Terraform:

```
export GOOGLE_CREDENTIALS="$(pwd)/sa-private-key.json"
```

Create a new gcs bucket to store terraform state (replace `cmp-9785-terraform-state` with your own bucket name, and pick a location that is near you):

```
gcloud storage buckets create gs://cmp-9785-terraform-state --location=us-central1
```

Update `providers.tf` with your bucket you have created. (It can be done by setting variables or using backend config, but I'm just lazy.)
