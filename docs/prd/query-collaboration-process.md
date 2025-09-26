# Query Collaboration Process

**Developer Agent Implementation Guide:**

For each chart requiring database integration, follow this collaboration workflow:

1. **Query Request Template:**
   - Agent identifies specific data fields, time filtering, aggregation needs
   - Agent requests expected performance parameters and row counts

2. **User Provides Base Query:**
   - Raw SQL working with existing phpMySQL database
   - Sample data output for validation
   - Known performance considerations

3. **Agent Optimization Process:**
   - Sequelize ORM implementation
   - Universal filtering integration (date, appeals, funds, frequency)
   - Comparison period calculations
   - Connection pooling and caching alignment

4. **Validation Cycle:**
   - User confirms data accuracy and performance
   - Edge case verification and acceptance criteria validation
