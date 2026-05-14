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
        post {
            always {
                archiveArtifacts artifacts: 'test-report.html', allowEmptyArchive: true
            }
        }
        failure {
            mail to: 'jasondstrang@gmail.com',
                subject: "FAILED: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}",
                body: "Tests failed! Check the report: ${env.BUILD_URL}"
        }
        success {
            mail to: 'jasondstrang@gmail.com',
                subject: "PASSED: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}",
                body: "All tests passed! Check the report: ${env.BUILD_URL}"
        }
}