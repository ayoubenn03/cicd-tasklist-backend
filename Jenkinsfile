pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Diagnostic environnement agent') {
            steps {
                sh '''
                    echo "=== Agent info ==="
                    hostname || true
                    whoami || true
                    uname -a || true
                    echo ""
                    echo "=== Node / npm ==="
                    node -v || echo "node: NON DISPONIBLE"
                    npm -v || echo "npm: NON DISPONIBLE"
                    echo ""
                    echo "=== Docker ==="
                    docker -v || echo "docker: NON DISPONIBLE"
                    docker info >/dev/null 2>&1 && echo "docker daemon: OK (accessible)" || echo "docker daemon: NON ACCESSIBLE"
                    echo ""
                    echo "=== Trivy ==="
                    trivy -v || echo "trivy: NON DISPONIBLE"
                    echo ""
                    echo "=== sonar-scanner ==="
                    sonar-scanner -v || echo "sonar-scanner: NON DISPONIBLE"
                    echo ""
                    echo "=== SBOM (syft / cdxgen) ==="
                    syft version || echo "syft: NON DISPONIBLE"
                    cdxgen -v || echo "cdxgen: NON DISPONIBLE"
                '''
            }
        }
    }
}
