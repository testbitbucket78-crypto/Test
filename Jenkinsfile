pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ECR_ACCOUNT = "514076760324"
        IMAGE_NAME = "cip-frontend"
        IMAGE_TAG = "latest"
        HELM_RELEASE = "cip-frontend"
        HELM_NAMESPACE = "default"
        KUBE_CONFIG = "/home/jenkins/.kube/config"  // make sure Jenkins has access
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'my-feature-branch', url: 'https://github.com/testbitbucket78-crypto/Test.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com
                docker build -t $IMAGE_NAME:$IMAGE_TAG .
                docker tag $IMAGE_NAME:$IMAGE_TAG $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:$IMAGE_TAG
                """
            }
        }

        stage('Push Docker Image') {
            steps {
                sh """
                docker push $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:$IMAGE_TAG
                """
            }
        }

        stage('Deploy to EKS with Helm') {
            steps {
                sh """
                export KUBECONFIG=$KUBE_CONFIG
                helm upgrade --install $HELM_RELEASE ./charts/$IMAGE_NAME \
                  --namespace $HELM_NAMESPACE \
                  --set image.repository=$ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME \
                  --set image.tag=$IMAGE_TAG
                """
            }
        }
    }

    post {
        always {
            sh "docker system prune -f"
        }
    }
}

