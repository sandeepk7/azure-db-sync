Follow https://buildkite.com/docs/agent/v3/gcloud#running-the-agent-on-google-container-engine
but :
on the cluster creation chose n1-highcpu-16 instances, and give "read write" permissions to Storage

on the "Create a deployment to start an agent:" step use change
```
         env:
           - name: BUILDKITE_AGENT_TOKEN
             valueFrom: {secretKeyRef: {name: buildkite-agent, key: token}}
```
to
```
         env:
           - name: BUILDKITE_AGENT_TOKEN
             valueFrom: {secretKeyRef: {name: buildkite-agent, key: token}}
           - name: BUILDKITE_AGENT_TAGS
             value: "linux=true"
           - name: BUILDKITE_TIMESTAMP_LINES
             value: "true"
```


config kubernetes to access container registry 
maybe just give write access to storage https://medium.com/google-cloud/updating-google-container-engine-vm-scopes-with-zero-downtime-50bff87e5f80
https://cloud.google.com/container-registry/docs/using-with-google-cloud-platform
https://container-solutions.com/using-google-container-registry-with-kubernetes/