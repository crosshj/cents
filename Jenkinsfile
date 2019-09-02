pipeline {
    agent any

    options {
        buildDiscarder(logRotator(
            numToKeepStr: '10',
            artifactNumToKeepStr: '10'
        ))
    }
    /*
        https://stackoverflow.com/a/44155346

        daysToKeepStr: history is only kept up to this days.
        numToKeepStr: only this number of build logs are kept.
        artifactDaysToKeepStr: artifacts are only kept up to this days.
        artifactNumToKeepStr: only this number of builds have their artifacts kept.
    */

    // environment { 
    // }

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                script {
                    NODE_VERSION = sh(
                        returnStdout: true,
                        script: 'node -v'
                    ).trim()

                    NPM_VERSION = sh(
                        returnStdout: true,
                        script: 'npm -v'
                    ).trim()
                }
                echo "NODE: " + NODE_VERSION + ", " + "NPM: " + NPM_VERSION
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Analyze') {
            steps {
                parallel (
                    "test" : {
                        echo 'Testing..'
                        sh 'npm run test.ci'
                    },
                    "lint" : {
                        sh 'npm run lint'
                    },
                    "build stats": {
                        echo 'TODO: build/dist analysis (jenkins plugin?) - https://survivejs.com/webpack/optimizing/build-analysis/'
                        sh 'npm run bundle.stats'
                    },
                    "audit": {
                        sh 'mv .npmrc .no-npmrc && npm i --package-lock-only && mv .no-npmrc .npmrc && npm audit'
                    }
                )
            }
            post {
                always {
                    junit 'build/reports/*.xml'
                    cobertura coberturaReportFile: 'build/coverage/cobertura-coverage.xml'
                }
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

                def COOKIE_SECRET = UUID.randomUUID().toString()
                writeFile(file: ".env", text: """
                    COOKIE_SECRET=${COOKIE_SECRET}
                    PORT=
                    MONGO=
                    REDDIS=
                """, encoding: "UTF-8")

                sshPublisher(
                    publishers: [sshPublisherDesc(
                        configName: 'ubuntu',
                        transfers: [sshTransfer(
                            cleanRemote: true,
                            excludes: '',
                            execCommand: 'touch ./deploy/it-happened.done',
                            execTimeout: 120000,
                            flatten: false,
                            makeEmptyDirs: true,
                            noDefaultExcludes: false,
                            patternSeparator: '[, ]+',
                            remoteDirectory: '/deploy/cents/',
                            remoteDirectorySDF: false,
                            removePrefix: '',
                            sourceFiles: 'dist/**, node_modules/**, server/**, service/**, deploy.sh, docker-compose.yml, .env'
                        )], 
                        usePromotionTimestamp: false, 
                        useWorkspaceInPromotion: false,
                        verbose: false
                    )]
                )
                
                echo 'https://dzone.com/articles/intro-to-jenkins-pipeline-and-using-publish-over-s'
                echo 'https://github.com/linuxacademy/devops-essentials-sample-app/blob/master/Jenkinsfile'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'webpack-stats.json', fingerprint: true
            // archiveArtifacts artifacts: 'node_modules/**, dist/**, server/**, service/**, deploy.sh, docker-compose.yml', fingerprint: true
        }
    }
}
