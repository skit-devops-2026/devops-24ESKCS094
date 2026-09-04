pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Check') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t petpal:latest .'
            }
        }
    }

    post {
        success {
            echo 'PetPal pipeline completed successfully.'
        }
        failure {
            echo 'PetPal pipeline failed. Check the stage logs.'
        }
    }
}