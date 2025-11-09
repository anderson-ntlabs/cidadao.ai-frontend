#!/usr/bin/env ts-node

/**
 * Diagnóstico de Endpoints do Chat - Sprint 1
 * Verifica quais endpoints do backend estão funcionando
 */

import axios from 'axios'
import chalk from 'chalk'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface EndpointTest {
  name: string
  method: 'GET' | 'POST' | 'DELETE' | 'WS'
  path: string
  body?: any
  expectedStatus?: number[]
}

const endpoints: EndpointTest[] = [
  {
    name: 'Chat Message (Principal)',
    method: 'POST',
    path: '/api/v1/chat/message',
    body: { message: 'Olá, teste de conexão' },
    expectedStatus: [200, 201],
  },
  {
    name: 'Chat Stream (SSE)',
    method: 'POST',
    path: '/api/v1/chat/stream',
    body: { message: 'Teste streaming' },
    expectedStatus: [200],
  },
  {
    name: 'Chat Suggestions',
    method: 'GET',
    path: '/api/v1/chat/suggestions',
    expectedStatus: [200],
  },
  {
    name: 'Chat History',
    method: 'GET',
    path: '/api/v1/chat/history/test-session',
    expectedStatus: [200, 404],
  },
  {
    name: 'Chat Agents',
    method: 'GET',
    path: '/api/v1/agents',
    expectedStatus: [200],
  },
  {
    name: 'WebSocket Endpoint',
    method: 'WS',
    path: '/api/v1/ws/chat/test-session',
    expectedStatus: [101],
  },
  // Endpoints alternativos/legacy
  {
    name: 'Investigation API (Fallback)',
    method: 'POST',
    path: '/api/v1/agents/abaporu/investigate',
    body: { query: 'teste', data_source: 'all' },
    expectedStatus: [200],
  },
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: [200],
  },
]

async function testEndpoint(test: EndpointTest): Promise<void> {
  const url = `${API_BASE_URL}${test.path}`
  console.log(`\n${chalk.blue('Testing:')} ${test.name}`)
  console.log(`${chalk.gray('URL:')} ${test.method} ${url}`)

  try {
    let response

    if (test.method === 'WS') {
      // Teste básico de WebSocket
      console.log(chalk.yellow('WebSocket test - verificando se o endpoint responde'))
      const wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://')
      console.log(`${chalk.gray('WS URL:')} ${wsUrl}`)
      // Por enquanto, apenas logamos - implementação real viria depois
      console.log(chalk.yellow('⚠️  WebSocket test requer implementação específica'))
      return
    }

    const startTime = Date.now()

    switch (test.method) {
      case 'GET':
        response = await axios.get(url)
        break
      case 'POST':
        response = await axios.post(url, test.body, {
          headers: { 'Content-Type': 'application/json' },
        })
        break
      case 'DELETE':
        response = await axios.delete(url)
        break
    }

    const duration = Date.now() - startTime
    const isExpected = test.expectedStatus?.includes(response.status) ?? true

    if (isExpected) {
      console.log(chalk.green(`✓ Status: ${response.status} (${duration}ms)`))
    } else {
      console.log(
        chalk.yellow(
          `⚠️  Status: ${response.status} (esperado: ${test.expectedStatus?.join(', ')})`
        )
      )
    }

    // Log da resposta se for bem-sucedida
    if (response.status === 200 || response.status === 201) {
      console.log(chalk.gray('Response preview:'))
      console.log(JSON.stringify(response.data, null, 2).substring(0, 200) + '...')
    }
  } catch (error: any) {
    const duration = Date.now() - Date.now()
    console.log(chalk.red(`✗ Erro: ${error.response?.status || error.code} - ${error.message}`))

    if (error.response?.data) {
      console.log(chalk.gray('Error details:'))
      console.log(JSON.stringify(error.response.data, null, 2).substring(0, 200))
    }
  }
}

async function runDiagnostics(): Promise<void> {
  console.log(chalk.bold.cyan('\n🔍 Diagnóstico de Endpoints do Chat - Cidadão.AI\n'))
  console.log(chalk.gray(`API Base URL: ${API_BASE_URL}`))
  console.log(chalk.gray(`Timestamp: ${new Date().toISOString()}`))
  console.log(chalk.gray('═'.repeat(60)))

  // Teste de conectividade básica
  console.log(chalk.yellow('\n📡 Verificando conectividade com o backend...'))
  try {
    await axios.get(`${API_BASE_URL}/`, { timeout: 5000 })
    console.log(chalk.green('✓ Backend está respondendo'))
  } catch (error) {
    console.log(chalk.red('✗ Backend não está acessível'))
    console.log(chalk.red('Verifique se o servidor está rodando em: ' + API_BASE_URL))
    process.exit(1)
  }

  // Testar cada endpoint
  for (const test of endpoints) {
    await testEndpoint(test)
    // Pequena pausa entre testes
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Resumo final
  console.log(chalk.gray('\n' + '═'.repeat(60)))
  console.log(chalk.bold.cyan('\n📊 Resumo do Diagnóstico\n'))

  console.log(chalk.yellow('Próximos passos:'))
  console.log('1. Verificar logs do backend para endpoints com erro')
  console.log('2. Confirmar se os endpoints estão implementados')
  console.log('3. Ajustar o frontend baseado nos endpoints disponíveis')
}

// Executar diagnóstico
runDiagnostics().catch(console.error)
