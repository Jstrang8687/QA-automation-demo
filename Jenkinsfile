pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Run QA in Node Container') {
            agent {
                docker {
                    image 'node:20-bullseye'
                    reuseNode true
                    args '-u root'
                }
            }

            steps {
                sh 'apt-get update && apt-get install -y chromium chromium-driver'
                sh 'npm install'
                sh 'chmod +x node_modules/.bin/*'
                sh 'npm test'
            }
        }
    }
}
