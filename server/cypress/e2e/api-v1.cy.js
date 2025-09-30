describe('GET /customers API', () => {
  const baseUrl = 'http://localhost:3001/customers';

  it('should return the default first page of customers with default limit and filters', () => {
    cy.request(baseUrl).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('customers').and.to.be.an('array').with.length.at.most(10);
      expect(response.body).to.have.property('pageInfo');
      expect(response.body.pageInfo).to.have.property('currentPage', 1);
      expect(response.body.pageInfo).to.have.property('totalPages').and.to.be.a('number');
      expect(response.body.pageInfo).to.have.property('totalCustomers').and.to.be.a('number');
    });
  });

  it('should paginate results with page and limit parameters', () => {
    cy.request(`${baseUrl}?page=2&limit=5`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.pageInfo.currentPage).to.eq(2);
      expect(response.body.customers).to.have.length.at.most(5);
    });
  });

  it('should filter customers by size and industry', () => {
    cy.request(`${baseUrl}?size=Medium&industry=Technology`).then((response) => {
      expect(response.status).to.eq(200);
      response.body.customers.forEach((customer) => {
        expect(customer.size).to.eq('Medium');
        expect(customer.industry).to.eq('Technology');
      });
    });
  });

  it('should return correct size based on the number of employees', () => {
    cy.request(`${baseUrl}?limit=20`).then((response) => {
      expect(response.status).to.eq(200);
      response.body.customers.forEach((customer) => {
        let expectedSize = 'Small';
        if (customer.employees >= 100 && customer.employees < 1000) expectedSize = 'Medium';
        else if (customer.employees >= 1000 && customer.employees < 10000) expectedSize = 'Enterprise';
        else if (customer.employees >= 10000 && customer.employees < 50000) expectedSize = 'Large Enterprise';
        else if (customer.employees >= 50000) expectedSize = 'Very Large Enterprise';
        expect(customer.size).to.eq(expectedSize);
      });
    });
  });

  it('should allow null contactInfo and address', () => {
    cy.request(baseUrl).then((response) => {
      expect(response.status).to.eq(200);
      response.body.customers.forEach((customer) => {
        expect(customer).to.have.property('contactInfo');
        expect(customer).to.have.property('address');
        // contactInfo or address can be null or objects; no assertion for value, just existence
      });
    });
  });

  it('should return 400 for invalid page and limit values', () => {
    cy.request({
      url: `${baseUrl}?page=-1&limit=abc`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should return 400 for unsupported size or industry', () => {
    cy.request({
      url: `${baseUrl}?size=Tiny&industry=Food`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should support all valid sizes and industries', () => {
    const sizes = ['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise'];
    const industries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance'];
    sizes.forEach((size) => {
      industries.forEach((industry) => {
        cy.request(`${baseUrl}?size=${encodeURIComponent(size)}&industry=${encodeURIComponent(industry)}`).then((response) => {
          expect(response.status).to.eq(200);
          response.body.customers.forEach((customer) => {
            expect(customer.size).to.eq(size);
            expect(customer.industry).to.eq(industry);
          });
        });
      });
    });
  });
});