pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO  = '514076760324.dkr.ecr.ap-south-1.amazonaws.com/test-nginx'
        IMAGE_TAG = "${env.BUILD_ID}"
        HELM_RELEASE = 'testbitbucket78'
        HELM_CHART_DIR = './testbitbucket78'
        KUBECONFIG = '/home/ubuntu/.kube/config' // path to kubeconfig if needed
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
                helm upgrade --install $HELM_RELEASE $HELM_CHART_DIR --namespace default
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}

