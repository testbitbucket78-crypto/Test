pipeline {
    agent any

    environment {
        AWS_REGION       = 'ap-south-1'
        ECR_REPO         = '514076760324.dkr.ecr.ap-south-1.amazonaws.com/test-nginx'
        IMAGE_TAG        = "${env.BUILD_ID}"  // Unique tag per build
        HELM_RELEASE     = 'testbitbucket78'
        HELM_CHART_DIR   = '.'                 // Path to Helm chart
        KUBECONFIG       = '/var/lib/jenkins/.kube/config'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/testbitbucket78-crypto/Test.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $ECR_REPO:$IMAGE_TAG .
                docker tag $ECR_REPO:$IMAGE_TAG $ECR_REPO:latest
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                docker push $ECR_REPO:$IMAGE_TAG
                docker push $ECR_REPO:latest
                '''
            }
        }

        stage('Update Helm values.yaml') {
            steps {
                sh '''
                sed -i "s|tag:.*|tag: \\"$IMAGE_TAG\\"|" $HELM_CHART_DIR/values.yaml
                '''
            }
        }

        stage('Deploy with Helm') {
            steps {
                sh '''
                helm upgrade --install $HELM_RELEASE $HELM_CHART_DIR \
                    --namespace default \
                    --kubeconfig $KUBECONFIG
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment succeeded! App is live on EKS."
        }
        failure {
            echo "Deployment failed! Check logs for errors."
        }
    }
}

