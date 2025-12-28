pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_ACCOUNT = '514076760324'
        ECR_REPO = 'cip-frontend'
        IMAGE_TAG = 'latest'
        KUBE_NAMESPACE = 'default'
        HELM_CHART_PATH = './charts/cip-frontend'
        KUBE_CONFIG = "${env.WORKSPACE}/.kube/config"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'my-feature-branch',
                    url: 'https://github.com/testbitbucket78-crypto/Test.git',
                    credentialsId: '2ee7ae3b-badc-4dc4-a081-f999a3b03d85'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t cip-frontend:${IMAGE_TAG} .
                        docker tag cip-frontend:${IMAGE_TAG} ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Login to ECR') {
            steps {
                script {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh """
                        docker push ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to EKS with Helm') {
            steps {
                script {
                    sh """
                        mkdir -p $(dirname ${KUBE_CONFIG})
                        aws eks update-kubeconfig --name cip-cluster --region ${AWS_REGION} --kubeconfig ${KUBE_CONFIG}
                        helm upgrade --install ${ECR_REPO} ${HELM_CHART_PATH} \
                            --namespace ${KUBE_NAMESPACE} \
                            --values ${HELM_CHART_PATH}/values.yaml \
                            --wait
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up unused Docker images..."
            sh 'docker system prune -f'
        }
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Deployment failed. Check logs above."
        }
    }
}

