pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                sh 'node -v'
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Analyze') {
            steps {
                echo 'Testing..'
                sh 'npm run test.ci'
                echo 'Analyzing..'
                echo 'TODO: coverage'
                echo 'TODO: linter'
                echo 'TODO: build/dist analysis - https://survivejs.com/webpack/optimizing/build-analysis/'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh 'npm prune --no-production'
                sh 'ls -l node_modules'
                echo 'TODO: attach all the stuff that needs to go to server and send'
                echo ' --- .env: port, cookie_secret, mongo, reddis, ...'
                echo ' --- other?'

                // sh 'ssh user@server rm -rf /var/www/temp_deploy/dist/'
                // sh 'ssh user@server mkdir -p /var/www/temp_deploy'
                // sh 'scp -r dist user@server:/var/www/temp_deploy/dist/'
                // sh 'ssh user@server "rm -rf /var/www/example.com/dist/ && mv /var/www/temp_deploy/dist/ /var/www/example.com/"'
                
                // https://dzone.com/articles/intro-to-jenkins-pipeline-and-using-publish-over-s
                // https://github.com/linuxacademy/devops-essentials-sample-app/blob/master/Jenkinsfile
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'node_modules/**, dist/**, server/**, service/**, deploy.sh, docker-compose.yml', fingerprint: true
            junit 'build/reports/*.xml'
        }
    }
}
