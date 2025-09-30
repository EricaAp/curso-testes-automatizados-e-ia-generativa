/// <reference types="cypress" />

const endpoint = `${Cypress.env('apiUrl')}/customers`

describe('GET /customers', () => {
  context('Recuperação bem-sucedida de clientes', () => {
    it('retorna estrutura correta de resposta com parâmetros padrão', () => {
      // Arrange

      // Act
      cy.request('GET', endpoint).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { customers, pageInfo } = body
        expect(customers).to.be.an('array')
        expect(pageInfo).to.be.an('object')
        expect(pageInfo).to.have.all.keys(['currentPage', 'totalPages', 'totalCustomers'])

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

          expect(id).to.be.a('number')
          expect(name).to.be.a('string')
          expect(employees).to.be.a('number')
          expect(['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise']).to.include(size)
          expect(['Logistics', 'Retail', 'Technology', 'HR', 'Finance']).to.include(industry)

          if (contactInfo !== null) {
            const { name: contactName, email } = contactInfo
            expect(contactName).to.be.a('string')
            expect(email).to.be.a('string')
          }

          if (address !== null) {
            const {
              street,
              city,
              state,
              zipCode,
              country
            } = address
            expect(street).to.be.a('string')
            expect(city).to.be.a('string')
            expect(state).to.be.a('string')
            expect(zipCode).to.be.a('string')
            expect(country).to.eq('United States of America')
          }
        }
      })
    })

    it('filtra clientes por size=Medium corretamente', () => {
      // Arrange

      // Act
      cy.request('GET', `${endpoint}?size=Medium`).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { customers } = body
        customers.forEach(({ size, employees }) => {
          expect(size).to.eq('Medium')
          expect(employees).to.be.gte(100)
          expect(employees).to.be.lt(1000)
        })
      })
    })

    it('filtra clientes por industry=Technology corretamente', () => {
      // Arrange

      // Act
      cy.request('GET', `${endpoint}?industry=Technology`).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { customers } = body
        customers.forEach(({ industry }) => {
          expect(industry).to.eq('Technology')
        })
      })
    })

    it('retorna paginação correta ao passar page=2 e limit=3', () => {
      // Arrange

      // Act
      cy.request('GET', `${endpoint}?page=2&limit=3`).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { pageInfo } = body
        expect(pageInfo.currentPage).to.eq(2)
        expect(pageInfo.totalPages).to.be.a('number')
        expect(pageInfo.totalCustomers).to.be.a('number')
      })
    })
  })

  context('Cenários de erro', () => {
    it('retorna erro ao passar page=0', () => {
      // Arrange

      // Act
      cy.request({
        method: 'GET',
        url: `${endpoint}?page=0`,
        failOnStatusCode: false
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        const { error } = body
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna erro ao passar page=-1', () => {
      // Arrange

      // Act
      cy.request({
        method: 'GET',
        url: `${endpoint}?page=-1`,
        failOnStatusCode: false
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        const { error } = body
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna erro ao passar limit=0', () => {
      // Arrange

      // Act
      cy.request({
        method: 'GET',
        url: `${endpoint}?limit=0`,
        failOnStatusCode: false
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        const { error } = body
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna erro ao passar limit=-1', () => {
      // Arrange

      // Act
      cy.request({
        method: 'GET',
        url: `${endpoint}?limit=-1`,
        failOnStatusCode: false
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        const { error } = body
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna erro ao passar size não suportado', () => {
      // Arrange

      // Act
      cy.request({
        method: 'GET',
        url: `${endpoint}?size=InvalidSize`,
        failOnStatusCode: false
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        const { error } = body
        expect(error).to.eq('Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.')
      })
    })

    it('retorna erro ao passar industry não suportado', () => {
      // Arrange

      // Act
      cy.request({
        method: 'GET',
        url: `${endpoint}?industry=InvalidIndustry`,
        failOnStatusCode: false
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        const { error } = body
        expect(error).to.eq('Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.')
      })
    })
  })
})