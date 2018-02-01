LAB_VERSION=0.2
MIXPANEL_TOKEN=6221bafa38007f6f95fb31da88456141
URL=https://accret.io

export LAB_VERSION
export MIXPANEL_TOKEN
export URL

publish:
	npm run build
	docker build -t gcr.io/galunches-193923/lab:$(LAB_VERSION) .
	gcloud docker -- push gcr.io/galunches-193923/lab:$(LAB_VERSION)

deploy:
	kubectl create -f ops/es-service.yml
	kubectl create -f ops/lab-service.yml
	kubectl create -f ops/es-deployment.yml
	envsubst < ops/lab-deployment.yml | kubectl create -f -
	kubectl create -f ops/lab-ingress.yml


destroy:
	kubectl delete -f ops/lab-ingress.yml
	envsubst < ops/lab-deployment.yml | kubectl delete -f -
	kubectl delete -f ops/es-deployment.yml
	kubectl delete -f ops/lab-service.yml
	kubectl delete -f ops/es-service.yml

update:
	envsubst < ops/lab-deployment.yml | kubectl replace -f -

test:
	kubectl create -f ops/lab-deployment.yml


disk:
	gcloud compute disks create --size=200GB --zone=europe-west4-b es-persisted


secret:
	kubectl create secret tls tls-secret --key=/tmp/accret.io.key --cert=ops/STAR_accret_io.crt
