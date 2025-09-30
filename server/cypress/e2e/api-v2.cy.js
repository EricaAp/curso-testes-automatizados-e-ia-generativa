describe('GET /customers endpoint', () => {
  const baseUrl = Cypress.env('apiUrl')

  it('returns customers and pageInfo when requesting page 2 with limit 10, size Medium, industry Technology', () => {
    cy.request('GET', `${baseUrl}/customers?page=2&limit=10&size=Medium&industry=Technology`).then(({ status, body }) => {
      expect(status).to.eq(200)
      const { customers, pageInfo } = body
      expect(Array.isArray(customers)).to.be.true
      expect(customers.length).to.be.at.most(10)
      customers.forEach(({ size, industry, employees }) => {
        expect(size).to.eq('Medium')
        expect(industry).to.eq('Technology')
        expect(employees).to.be.gte(100)
        expect(employees).to.be.lt(1000)
      })
      const { currentPage, totalPages, totalCustomers } = pageInfo
      expect(currentPage).to.eq(2)
      expect(totalPages).to.be.a('number')
      expect(totalCustomers).to.be.a('number')
    })
  })

  it('returns all customers with defaults when no query params are provided', () => {
    cy.request('GET', `${baseUrl}/customers`).then(({ status, body }) => {
      expect(status).to.eq(200)
      const { customers, pageInfo } = body
      expect(Array.isArray(customers)).to.be.true
      expect(customers.length).to.be.at.most(10)
      customers.forEach(({ size, industry }) => {
        expect(['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise']).to.include(size)
        expect(['Logistics', 'Retail', 'Technology', 'HR', 'Finance']).to.include(industry)
      })
      expect(pageInfo.currentPage).to.eq(1)
    })
  })

  it('returns customers filtered by size Small and industry Retail', () => {
    cy.request('GET', `${baseUrl}/customers?size=Small&industry=Retail`).then(({ status, body }) => {
      expect(status).to.eq(200)
      const { customers } = body
      customers.forEach(({ size, industry, employees }) => {
        expect(size).to.eq('Small')
        expect(industry).to.eq('Retail')
        expect(employees).to.be.lt(100)
      })
    })
  })

  it('returns 400 status for invalid (negative) page parameter', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/customers?page=-1`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })

  it('returns 400 status for invalid (non-number) limit parameter', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/customers?limit=abc`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })

  it('returns 400 status for unsupported size value', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/customers?size=Gigantic`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })

  it('returns 400 status for unsupported industry value', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/customers?industry=UnknownSector`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })
})