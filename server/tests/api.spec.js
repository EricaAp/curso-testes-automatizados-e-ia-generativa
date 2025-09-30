// @ts-check
const { test, expect } = require('@playwright/test')

// const endpoint = `${process.env.API_URL}/customers`
const endpoint = 'http://localhost:3001/customers'
test.describe('GET /customers', () => {
  test.describe('Recuperação bem-sucedida de clientes', () => {
    test('retorna estrutura correta de resposta com parâmetros padrão', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers, pageInfo } = body
      expect(Array.isArray(customers)).toBe(true)
      expect(pageInfo).toEqual(expect.objectContaining({
        currentPage: expect.any(Number),
        totalPages: expect.any(Number),
        totalCustomers: expect.any(Number),
      }))

      if (customers.length > 0) {
        const {
          id,
          name,
          employees,
          contactInfo,
          size,
          industry,
          address
        } = customers[0]

        expect(typeof id).toBe('number')
        expect(typeof name).toBe('string')
        expect(typeof employees).toBe('number')
        expect(['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise']).toContain(size)
        expect(['Logistics', 'Retail', 'Technology', 'HR', 'Finance']).toContain(industry)

        if (contactInfo !== null) {
          const { name: contactName, email } = contactInfo
          expect(typeof contactName).toBe('string')
          expect(typeof email).toBe('string')
        }

        if (address !== null) {
          const {
            street,
            city,
            state,
            zipCode,
            country
          } = address
          expect(typeof street).toBe('string')
          expect(typeof city).toBe('string')
          expect(typeof state).toBe('string')
          expect(typeof zipCode).toBe('string')
          expect(country).toBe('United States of America')
        }
      }
    })

    test('filtra clientes por size=Medium corretamente', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?size=Medium`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers } = body
      for (const { size, employees } of customers) {
        expect(size).toBe('Medium')
        expect(employees).toBeGreaterThanOrEqual(100)
        expect(employees).toBeLessThan(1000)
      }
    })

    test('filtra clientes por industry=Technology corretamente', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?industry=Technology`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers } = body
      for (const { industry } of customers) {
        expect(industry).toBe('Technology')
      }
    })

    test('retorna paginação correta ao passar page=2 e limit=3', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?page=2&limit=3`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { pageInfo } = body
      expect(pageInfo.currentPage).toBe(2)
      expect(typeof pageInfo.totalPages).toBe('number')
      expect(typeof pageInfo.totalCustomers).toBe('number')
    })
  })

  test.describe('Cenários de erro', () => {
    test('retorna erro ao passar page=0', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?page=0`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna erro ao passar page=-1', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?page=-1`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna erro ao passar limit=0', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?limit=0`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna erro ao passar limit=-1', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?limit=-1`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna erro ao passar size não suportado', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?size=InvalidSize`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      const { error } = body
      expect(error).toBe('Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.')
    })

    test('retorna erro ao passar industry não suportado', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${endpoint}?industry=InvalidIndustry`)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      const { error } = body
      expect(error).toBe('Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.')
    })
  })
})