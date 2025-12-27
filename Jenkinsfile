pipeline {
  agent any

  environment {
    AWS_REGION = "ap-south-1"
    ECR_REPO   = "514076760324.dkr.ecr.ap-south-1.amazonaws.com/test-nginx"
    IMAGE_TAG  = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
            url: 'https://github.com/testbitbucket78-crypto/Test.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh """
        docker build --no-cache -t $ECR_REPO:$IMAGE_TAG .
        docker tag $ECR_REPO:$IMAGE_TAG $ECR_REPO:latest
        """
      }
    }

    stage('Login to ECR') {
      steps {
        sh """
        aws ecr get-login-password --region $AWS_REGION \
        | docker login --username AWS --password-stdin $ECR_REPO
        """
      }
    }

    stage('Push Image') {
      steps {
        sh """
        docker push $ECR_REPO:$IMAGE_TAG
        docker push $ECR_REPO:latest
        """
      }
    }

    stage('Update Helm values') {
      steps {
        sh """
        sed -i 's/tag:.*/tag: "${IMAGE_TAG}"/' values.yaml
        """
      }
    }

    stage('Deploy to EKS') {
      steps {
        sh """
        helm upgrade --install testbitbucket78 . \
        --namespace default \
        --kubeconfig /var/lib/jenkins/.kube/config
        """
      }
    }
  }

  post {
    success {
      echo "Deployment succeeded! App is live on EKS."
    }
  }
}

