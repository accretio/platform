LAB_VERSION=0.4
MIXPANEL_TOKEN=6221bafa38007f6f95fb31da88456141
URL=https://accret.io

export LAB_VERSION
export MIXPANEL_TOKEN
export URL

publish:
	docker build -t gcr.io/accretio-180222/lab:$(LAB_VERSION) .
	gcloud docker -- push gcr.io/accretio-180222/lab:$(LAB_VERSION)

deploy:
	kubectl create -f ops/es-service.yml
	kubectl create -f ops/lab-service.yml
	kubectl create -f ops/es-deployment.yml
	kubectl create -f ops/lab-deployment.yml
	kubectl create -f ops/lab-ingress.yml


destroy:
	kubectl delete -f ops/lab-ingress.yml
	kubectl delete -f ops/lab-deployment.yml
	kubectl delete -f ops/es-deployment.yml
	kubectl delete -f ops/lab-service.yml
	kubectl delete -f ops/es-service.yml

update:
	kubectl replace -f ops/lab-deployment.yml

test:
	kubectl create -f ops/lab-deployment.yml


disk:
	gcloud compute disks create --size=200GB --zone=us-east4-b es-persisted


secret:
	kubectl create secret tls tls-secret --key=/tmp/accret.io.key --cert=ops/STAR_accret_io.crt
