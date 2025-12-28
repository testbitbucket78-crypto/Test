pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ECR_ACCOUNT = "514076760324"
        IMAGE_NAME = "cip-frontend"
        IMAGE_TAG = "latest"
        HELM_RELEASE = "cip-frontend"
        HELM_NAMESPACE = "default"
        KUBE_CONFIG = "/var/lib/jenkins/.kube/config" // Path where kubeconfig is accessible
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'my-feature-branch']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/testbitbucket78-crypto/Test.git',
                        credentialsId: '2ee7ae3b-badc-4dc4-a081-f999a3b03d85'
                    ]]
                ])
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                echo 'Logging in to ECR...'
                aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com
                
                echo 'Building Docker image...'
                docker build -t $IMAGE_NAME:$IMAGE_TAG .
                
                echo 'Tagging Docker image for ECR...'
                docker tag $IMAGE_NAME:$IMAGE_TAG $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:$IMAGE_TAG
                """
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                sh """
                echo 'Pushing Docker image to ECR...'
                docker push $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:$IMAGE_TAG
                """
            }
        }

        stage('Deploy to EKS using Helm') {
            steps {
                sh """
                echo 'Deploying to EKS...'
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
            echo 'Cleaning up unused Docker images...'
            sh 'docker system prune -f'
        }
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed. Check logs above for errors.'
        }
    }
}

