# Learnify AWS Deployment Documentation

Learnify is a full-stack e-learning and video-conferencing platform. This document records the AWS infrastructure and deployment workflow.

## Deployment Architecture

- **Frontend:** React.js deployed with AWS Amplify
- **Backend:** Node.js and Express.js hosted on Amazon EC2
- **Database:** MongoDB Atlas
- **Networking:** Elastic IP and EC2 security groups
- **Monitoring:** Amazon CloudWatch
- **Storage:** Amazon EBS
- **Version control:** Git and GitHub

## AWS Deployment Screenshots

### 1. EC2 instance launch

Successfully initiated the launch of the Learnify backend EC2 instance.

![1. EC2 instance launch](docs/aws-deployment/01-instance-launch.png)

### 2. Elastic IP allocation

Allocated an Elastic IP address for stable public addressing.

![2. Elastic IP allocation](docs/aws-deployment/02-elastic-ip-allocation.png)

### 3. Elastic IP association

Associated the Elastic IP with the backend EC2 instance.

![3. Elastic IP association](docs/aws-deployment/03-elastic-ip-association.png)

### 4. Security group inbound rules

Reviewed inbound HTTP, HTTPS, and SSH rules. Keep production rules as restrictive as possible.

![4. Security group inbound rules](docs/aws-deployment/04-security-group-rules.png)

### 5. Backend process and database connection

Started the Node.js backend and verified the MongoDB connection.

![5. Backend process and database connection](docs/aws-deployment/05-backend-running.png)

### 6. EC2 instance status

Verified that the instance was running and status checks had passed.

![6. EC2 instance status](docs/aws-deployment/06-ec2-instance-running.png)

### 7. CloudWatch monitoring

Reviewed CPU utilization and network metrics.

![7. CloudWatch monitoring](docs/aws-deployment/07-instance-monitoring.png)

### 8. EBS storage volume

Reviewed the attached Elastic Block Store volume.

![8. EBS storage volume](docs/aws-deployment/08-ec2-storage-volume.png)

### 9. EC2 key pair

Documented the key-pair configuration. Never upload the private .pem key.

![9. EC2 key pair](docs/aws-deployment/09-key-pair-configuration.png)

### 10. Security groups

Reviewed the available EC2 security groups.

![10. Security groups](docs/aws-deployment/10-security-groups.png)

### 11. Amplify repository setup

Selected the GitHub repository and production branch for the frontend.

![11. Amplify repository setup](docs/aws-deployment/11-amplify-repository-setup.png)

### 12. Amplify deployment history

Reviewed the frontend build and deployment status.

![12. Amplify deployment history](docs/aws-deployment/12-amplify-deployment.png)

### 13. Amplify app settings

Reviewed the Amplify application and production branch settings.

![13. Amplify app settings](docs/aws-deployment/13-amplify-app-settings.png)

### 14. AWS billing overview

Reviewed AWS billing and cost information.

![14. AWS billing overview](docs/aws-deployment/14-aws-cost-overview.png)

### 15. AWS dashboard and credits

Reviewed account-level usage and credit information.

![15. AWS dashboard and credits](docs/aws-deployment/15-aws-dashboard-credits.png)

### 16. Elastic IP details

Recorded the Elastic IP configuration details.

![16. Elastic IP details](docs/aws-deployment/16-elastic-ip-details.png)

### 17. GitHub repository

Shows the project repository and source-code structure.

![17. GitHub repository](docs/aws-deployment/17-github-repository-overview.png)

### 18. Amplify build/deploy details

Shows build and deployment information.

![18. Amplify build/deploy details](docs/aws-deployment/18-amplify-build-deployment.png)

### 19. Additional EC2 configuration

Additional infrastructure configuration evidence.

![19. Additional EC2 configuration](docs/aws-deployment/19-ec2-configuration.png)

## Deployment Summary

- Hosted the Node.js/Express backend on Amazon EC2.
- Connected the backend to MongoDB Atlas.
- Configured an Elastic IP and EC2 security groups.
- Deployed the React frontend using AWS Amplify.
- Reviewed instance monitoring, storage, and AWS cost information.

## Technology Stack

React.js · Node.js · Express.js · MongoDB Atlas · Amazon EC2 · AWS Amplify · Elastic IP · EBS · CloudWatch · GitHub

## Repository

https://github.com/Amitprajapati111/Lernify

---

**Security note:** Before publishing screenshots in a public repository, redact AWS account IDs, private or sensitive identifiers, and any credentials. Never upload `.env` files, passwords, access keys, or private SSH keys.
