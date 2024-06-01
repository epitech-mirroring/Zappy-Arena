pipeline {
    agent any
    environment {
        IS_PRODUCTION = true
        APP_ROOT = '/opt/zappy-arena'
        GHCR_TOKEN = credentials('github-packages-token')
        IMAGE_VERSION = '1.00.0'
        IMAGE_NAME_BASE = 'epitech-mirroring/zappy-arena'
    }
    stages {
        stage('📥 Checkout') {
            steps {
                script {
                    def isInProduction = env.BRANCH_NAME == 'master'
                    if (isInProduction) {
                        IS_PRODUCTION = true
                    } else {
                        IS_PRODUCTION = false
                    }
                }

                // Clean before checkout
                cleanWs()

                // Clone the repository
                checkout scm

                script {
                    // Check bun is installed
                    def bun = sh(script: 'bun --version', returnStatus: true)
                    if (bun != 0) {
                        sh 'curl -fsSL https://bun.sh/install | bash'
                        sh 'export PATH=$PATH:$HOME/.bun/bin/bun'
                    }
                }

                // login to the GitHub Container Registry
                sh "echo ${GHCR_TOKEN_PSW} | docker login ghcr.io -u ${GHCR_TOKEN_USR} --password-stdin"

            }
        }
        stage ('🧪 Tests') {
            steps {
                // Run backend tests
                sh 'cd backend && bun install && bun run test'

                // Run frontend tests
                sh 'cd frontend && bun install && bun run test'
            }
        }

        stage('🏗️ Build') {
            steps {
                script {
                    if (!IS_PRODUCTION) {
                        IMAGE_VERSION += "-snapshot"
                        NODE_ENV = 'development'
                    } else {
                        NODE_ENV = 'production'
                    }

                    // Build backend
                    sh "export NODE_ENV=${NODE_ENV} && cd backend && docker build -t ${IMAGE_NAME_BASE}-back:${IMAGE_VERSION} ."
                    sh "docker tag ${IMAGE_NAME_BASE}-back:${IMAGE_VERSION} ghcr.io/${IMAGE_NAME_BASE}-back:${IMAGE_VERSION}"
                    if (!IS_PRODUCTION) {
                        sh "docker tag ${IMAGE_NAME_BASE}-back:${IMAGE_VERSION} ${IMAGE_NAME_BASE}-back:latest-snapshot"
                        sh "docker tag ${IMAGE_NAME_BASE}-back:${IMAGE_VERSION} ghcr.io/${IMAGE_NAME_BASE}-back:latest-snapshot"
                    } else {
                        sh "docker tag ${IMAGE_NAME_BASE}-back:${IMAGE_VERSION} ghcr.io/${IMAGE_NAME_BASE}-back:latest"
                        sh "docker tag ${IMAGE_NAME_BASE}-back:${IMAGE_VERSION} ${IMAGE_NAME_BASE}-back:latest"
                    }

                    // Build frontend
                    sh "export NODE_ENV=${NODE_ENV} && cd frontend && docker build -t ${IMAGE_NAME_BASE}-front:${IMAGE_VERSION} ."
                    sh "docker tag ${IMAGE_NAME_BASE}-front:${IMAGE_VERSION} ghcr.io/${IMAGE_NAME_BASE}-front:${IMAGE_VERSION}"
                    if (!IS_PRODUCTION) {
                        sh "docker tag ${IMAGE_NAME_BASE}-front:${IMAGE_VERSION} ${IMAGE_NAME_BASE}-front:latest-snapshot"
                        sh "docker tag ${IMAGE_NAME_BASE}-front:${IMAGE_VERSION} ghcr.io/${IMAGE_NAME_BASE}-front:latest-snapshot"
                    } else {
                        sh "docker tag ${IMAGE_NAME_BASE}-front:${IMAGE_VERSION} ghcr.io/${IMAGE_NAME_BASE}-front:latest"
                        sh "docker tag ${IMAGE_NAME_BASE}-front:${IMAGE_VERSION} ${IMAGE_NAME_BASE}-front:latest"
                    }
                }
            }
        }
        stage('🚀 Deploy') {
            steps {
                script {
                    // Push backend
                    sh "docker push ghcr.io/${IMAGE_NAME_BASE}-back:${IMAGE_VERSION}"
                    if (!IS_PRODUCTION) {
                        sh "docker push ghcr.io/${IMAGE_NAME_BASE}-back:latest-snapshot"
                    } else {
                        sh "docker push ghcr.io/${IMAGE_NAME_BASE}-back:latest"
                    }

                    // Push frontend
                    sh "docker push ghcr.io/${IMAGE_NAME_BASE}-front:${IMAGE_VERSION}"
                    if (!IS_PRODUCTION) {
                        sh "docker push ghcr.io/${IMAGE_NAME_BASE}-front:latest-snapshot"
                    } else {
                        sh "docker push ghcr.io/${IMAGE_NAME_BASE}-front:latest"
                    }

                    // Restart the service
                    withCredentials([usernamePassword(credentialsId: 'aeserv-jenkins-usr', usernameVariable: 'AESERV_JENKINS_USR', passwordVariable: 'AESERV_JENKINS_PSW'),
                                     string(credentialsId: 'aeserv-jenkins-ip', variable: 'AESERV_JENKINS_IP')]) {
                        if (IS_PRODUCTION) {
                            sh "sshpass -p ${AESERV_JENKINS_PSW} ssh -o StrictHostKeyChecking=no ${AESERV_JENKINS_USR}@${AESERV_JENKINS_IP} -p 42 'cd ${APP_ROOT}/production && docker compose pull && docker compose up -d'"
                        } else {
                            sh "sshpass -p ${AESERV_JENKINS_PSW} ssh -o StrictHostKeyChecking=no ${AESERV_JENKINS_USR}@${AESERV_JENKINS_IP} -p 42 'cd ${APP_ROOT}/staging && docker compose pull && docker compose up -d'"
                        }
                    }
                }
            }
        }
    }
    post {
        // Clean after build
        always {
            cleanWs(cleanWhenNotBuilt: true,
                    deleteDirs: true,
                    disableDeferredWipeout: true,
                    notFailBuild: true,
                    patterns: [[pattern: '.gitignore', type: 'INCLUDE'],
                               [pattern: '.propsfile', type: 'EXCLUDE']])
        }
    }
}