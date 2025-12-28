pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ECR_ACCOUNT = "514076760324"
        ECR_REPO = "cip-frontend"
        IMAGE_TAG = "latest"
        EKS_CLUSTER = "cip-cluster"
        HELM_CHART_PATH = "./charts/cip-frontend"
        K8S_NAMESPACE = "default"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/my-feature-branch']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/testbitbucket78-crypto/Test.git',
                        credentialsId: '2ee7ae3b-badc-4dc4-a081-f999a3b03d85'
                    ]]
                ])
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
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

        stage('Tag and Push Docker Image') {
            steps {
                script {
                    sh """
                        docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                        docker push ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to EKS using Helm') {
            steps {
                script {
                    // Update kubeconfig
                    sh "aws eks update-kubeconfig --name ${EKS_CLUSTER} --region ${AWS_REGION}"
                    
                    // Helm deploy
                    sh """
                        helm upgrade --install ${ECR_REPO} ${HELM_CHART_PATH} \
                        --namespace ${K8S_NAMESPACE} \
                        --set image.repository=${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO} \
                        --set image.tag=${IMAGE_TAG} \
                        --wait
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up unused Docker images..."
            sh "docker system prune -f"
        }
        success {
            echo "Deployment completed successfully!"
        }
        failure {
            echo "Deployment failed. Check the logs above for errors."
        }
    }
}

