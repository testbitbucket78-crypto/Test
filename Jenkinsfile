pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO = '514076760324.dkr.ecr.ap-south-1.amazonaws.com/cip-frontend'
        IMAGE_TAG = 'latest'
        EKS_CLUSTER = 'cip-cluster'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git branch: 'my-feature-branch',
                    url: 'https://github.com/testbitbucket78-crypto/Test.git',
                    credentialsId: '2ee7ae3b-badc-4dc4-a081-f999a3b03d85'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t cip-frontend:latest .
                """
            }
        }

        stage('Login to ECR') {
            steps {
                sh """
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REPO
                """
            }
        }

        stage('Tag and Push Docker Image') {
            steps {
                sh """
                    docker tag cip-frontend:latest $ECR_REPO:$IMAGE_TAG
                    docker push $ECR_REPO:$IMAGE_TAG
                """
            }
        }

        stage('Deploy to EKS using Helm') {
            steps {
                sh """
                    aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION
                    helm upgrade --install cip-frontend ./charts/cip-frontend \
                        --namespace default \
                        --values ./charts/cip-frontend/values.yaml \
                        --wait
                """
            }
        }
    }

    post {
        always {
            echo "Cleaning up unused Docker images..."
            sh 'docker system prune -f'
        }
        failure {
            echo "Deployment failed. Check logs above for errors."
        }
        success {
            echo "Deployment succeeded!"
        }
    }
}

