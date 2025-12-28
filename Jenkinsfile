pipeline {
    agent any

    environment {
        AWS_REGION    = 'ap-south-1'   // change
        ECR_REPO      = '123456789012.dkr.ecr.ap-south-1.amazonaws.com/cip-frontend'
        APP_NAME      = 'cip-frontend'
        CHART_DIR     = 'charts/cip-frontend'
        K8S_NAMESPACE = 'cip-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Angular') {
            steps {
                sh 'npm ci'
                sh 'ng build --configuration=production'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def tag = env.BUILD_NUMBER

                    sh """
                      aws ecr get-login-password --region ${AWS_REGION} \
                        | docker login --username AWS --password-stdin ${ECR_REPO}

                      docker build -t ${ECR_REPO}:${tag} -t ${ECR_REPO}:latest .
                    """
                }
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                script {
                    def tag = env.BUILD_NUMBER
                    sh """
                      docker push ${ECR_REPO}:${tag}
                      docker push ${ECR_REPO}:latest
                    """
                }
            }
        }

        stage('Helm upgrade/install to EKS') {
            steps {
                script {
                    def tag = env.BUILD_NUMBER
                    sh """
                      helm upgrade --install ${APP_NAME} ${CHART_DIR} \
                        --namespace ${K8S_NAMESPACE} --create-namespace \
                        --set image.repository=${ECR_REPO} \
                        --set image.tag=${tag}
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
        }
    }
}

