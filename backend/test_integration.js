const http = require('http');

const API_URL = 'http://localhost:5000/api';
let token = '';
let verificationCode = '';

// Helper to make JSON requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      
      // For PDF binary streams
      if (res.headers['content-type'] === 'application/pdf') {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks)
          });
        });
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Integration Tests for AlimentosLMS...');
  
  try {
    // 1. Test Auth Login
    console.log('\n--- 1. Testing Login Endpoint ---');
    const loginRes = await request('POST', '/auth/login', {
      cedula: '123456789',
      password: 'password123'
    });
    
    if (loginRes.statusCode !== 200 || !loginRes.body.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    
    token = loginRes.body.token;
    console.log('✓ Login successful! Token received.');
    console.log(`Student Name: ${loginRes.body.user.nombre_completo}`);
    
    // 2. Test Get Course Content
    console.log('\n--- 2. Testing Get Course Modules ---');
    const contentRes = await request('GET', '/course/content');
    if (contentRes.statusCode !== 200 || !Array.isArray(contentRes.body)) {
      throw new Error(`Get course content failed: ${JSON.stringify(contentRes.body)}`);
    }
    console.log(`✓ Retrieved ${contentRes.body.length} modules successfully.`);
    const modules = contentRes.body;
    
    // 3. Mark all modules as completed sequentially
    console.log('\n--- 3. Testing Course Progression ---');
    for (const m of modules) {
      console.log(`Completing module ${m.id}: "${m.titulo.substring(0, 30)}..."`);
      const progressRes = await request('POST', '/course/progress', { modulo_id: m.id });
      if (progressRes.statusCode !== 200) {
        throw new Error(`Failed to complete module ${m.id}: ${JSON.stringify(progressRes.body)}`);
      }
    }
    
    // Check final progress
    const finalProgRes = await request('GET', '/course/progress');
    if (finalProgRes.statusCode !== 200 || finalProgRes.body.progreso_porcentaje !== 100) {
      throw new Error(`Progress is not 100%: ${JSON.stringify(finalProgRes.body)}`);
    }
    console.log('✓ Course progression verified: 100% completed.');

    // 4. Submit Exam
    console.log('\n--- 4. Testing Exam Evaluation ---');
    // Correct answers based on database seed
    const correctAnswers = {
      "1": "C",
      "2": "B",
      "3": "C",
      "4": "B",
      "5": "B",
      "6": "C",
      "7": "B",
      "8": "C"
    };
    
    const examRes = await request('POST', '/exam/submit', { respuestas: correctAnswers });
    if (examRes.statusCode !== 200 || !examRes.body.aprobado) {
      throw new Error(`Exam evaluation failed: ${JSON.stringify(examRes.body)}`);
    }
    console.log(`✓ Exam passed! Score: ${examRes.body.puntaje}%. Message: ${examRes.body.message}`);

    // 5. Fetch Certificate Details
    console.log('\n--- 5. Testing Certificate Metadata ---');
    const certDetailsRes = await request('GET', '/certificate/detail');
    if (certDetailsRes.statusCode !== 200 || !certDetailsRes.body.codigo_verificacion) {
      throw new Error(`Failed to retrieve certificate details: ${JSON.stringify(certDetailsRes.body)}`);
    }
    verificationCode = certDetailsRes.body.codigo_verificacion;
    console.log(`✓ Certificate metadata fetched! Code: ${verificationCode}`);

    // 6. Download Certificate PDF binary stream
    console.log('\n--- 6. Testing PDF Generation & Download ---');
    const downloadRes = await request('GET', '/certificate/download');
    if (downloadRes.statusCode !== 200 || downloadRes.headers['content-type'] !== 'application/pdf') {
      throw new Error(`PDF download failed. Status: ${downloadRes.statusCode}, Content-Type: ${downloadRes.headers['content-type']}`);
    }
    const pdfBuffer = downloadRes.body;
    console.log(`✓ Certificate PDF successfully generated and received. Size: ${pdfBuffer.length} bytes.`);
    
    // 7. Verify Certificate (Public Route)
    console.log('\n--- 7. Testing Public Verification Portal ---');
    const verifyRes = await request('GET', `/certificate/verify/${verificationCode}`);
    if (verifyRes.statusCode !== 200 || !verifyRes.body.valido) {
      throw new Error(`Certificate verification failed: ${JSON.stringify(verifyRes.body)}`);
    }
    console.log('✓ Verification successful!');
    console.log(`Details: User "${verifyRes.body.usuario}" (Cedula: ${verifyRes.body.cedula}) approved on ${verifyRes.body.fecha_emision}.`);
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! The LMS backend API is 100% compliant.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    process.exit(1);
  }
}

// Introduce brief timeout to allow server to be ready
setTimeout(runTests, 1000);
