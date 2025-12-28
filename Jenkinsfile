pipeline {
    agent any

    environment {
        AWS_REGION   = 'ap-south-1'
        ECR_ACCOUNT  = '514076760324'
        IMAGE_NAME   = 'cip-frontend'
        IMAGE_TAG    = 'latest'
        HELM_RELEASE = 'cip-frontend'
        HELM_CHART   = './charts/cip-frontend'
        KUBE_CONTEXT = 'your-eks-context'
        NAMESPACE    = 'default'
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
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Tag and Push Docker Image') {
            steps {
                sh """
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} \
                    ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${IMAGE_TAG}

                    docker push ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to EKS using Helm') {
            steps {
                sh """
                    kubectl config use-context ${KUBE_CONTEXT}
                    helm upgrade --install ${HELM_RELEASE} ${HELM_CHART} \
                        --namespace ${NAMESPACE} \
                        --set image.repository=${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME} \
                        --set image.tag=${IMAGE_TAG} \
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

