pipeline {
    agent any

    environment {
        IMAGE_NAME = "frontend-app"
        CONTAINER_NAME = "frontend-app-container"
        HOST_PORT = "3000"          // ✅ 80이 아닌 사용 가능한 포트로 수정
        CONTAINER_PORT = "80"       // Nginx는 여전히 80에서 서비스
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $IMAGE_NAME ."
            }
        }

        stage('Deploy') {
            steps {
                echo "🔁 기존 컨테이너 제거"
                sh "docker rm -f $CONTAINER_NAME || true"

                echo "🚀 새 컨테이너 실행"
                sh "docker run -d -p ${HOST_PORT}:${CONTAINER_PORT} --name $CONTAINER_NAME $IMAGE_NAME"
            }
        }

        stage('Check Running Container') {
            steps {
                echo "✅ 실행 중인 컨테이너 확인"
                sh "docker ps"
            }
        }
    }

    post {
        success {
            echo "✅ 배포 성공! 접속 주소: http://<EC2-IP>:${HOST_PORT}"
        }
        failure {
            echo "❌ 배포 실패! 로그 확인 필요"
        }
    }
}
