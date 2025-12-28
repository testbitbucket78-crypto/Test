pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ECR_ACCOUNT = "514076760324"
        IMAGE_NAME = "cip-frontend"
        IMAGE_TAG = "latest"
        EKS_CLUSTER = "cip-cluster"
        HELM_CHART_PATH = "./charts/cip-frontend"
        KUBE_NAMESPACE = "default"
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
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage('Login to ECR') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} \
                | docker login --username AWS --password-stdin ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Tag and Push Docker Image') {
            steps {
                sh """
                docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${IMAGE_TAG}
                docker push ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to EKS using Helm') {
            steps {
                sh """
                aws eks update-kubeconfig --name ${EKS_CLUSTER} --region ${AWS_REGION}
                helm upgrade --install ${IMAGE_NAME} ${HELM_CHART_PATH} \
                    --namespace ${KUBE_NAMESPACE} \
                    --values ${HELM_CHART_PATH}/values.yaml \
                    --wait
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

