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
                    image 'node:18'
                    reuseNode true
                    args '-u root'
                }
            }

            steps {
                sh 'npm install'
                sh 'chmod +x node_modules/.bin/*'
                sh 'npm test'
            }
        }
    }
}
