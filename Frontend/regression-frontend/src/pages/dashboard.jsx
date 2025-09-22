import React from 'react';
import { useGetSummaryQuery } from '../services/runTestCases.api.services';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // Mock data - replace with your RTK Query hook
  const navigate = useNavigate();
  const { data: summaryData } = useGetSummaryQuery();
  const isLoading = false;
  const error = null;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{
        height: '16px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '75%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}></div>
      <div style={{
        height: '32px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '50%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}></div>
    </div>
  );

  const summaryCards = [
    {
      title: 'Total Projects',
      value: summaryData?.totalProjects || 0,
      icon: '📊',
      color: '#1976d2',
      bgColor: '#e3f2fd',
      borderColor: '#90caf9'
    },
    {
      title: 'Total Test Cases',
      value: summaryData?.totalTestCases || 0,
      icon: '📄',
      color: '#388e3c',
      bgColor: '#e8f5e8',
      borderColor: '#81c784'
    },
    {
      title: 'Total Test Steps',
      value: summaryData?.totalTestSteps || 0,
      icon: '📋',
      color: '#f57c00',
      bgColor: '#fff3e0',
      borderColor: '#ffb74d'
    },
    {
      title: 'Avg Steps per Test',
      value: summaryData?.avgSteps || 0,
      icon: '📈',
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
      borderColor: '#ba68c8'
    }
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '32px', marginRight: '12px' }}>⚠️</span>
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#c62828',
                margin: '0 0 8px 0'
              }}>
                Error Loading Dashboard
              </h3>
              <p style={{ color: '#d32f2f', margin: 0 }}>
                Unable to fetch dashboard data. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#212121',
            margin: '0 0 12px 0'
          }}>
            Dashboard Overview
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666666',
            margin: 0
          }}>
            Monitor your automated test suite performance at a glance
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {summaryCards.map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: `2px solid ${card.borderColor}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#666666',
                    margin: '0 0 8px 0'
                  }}>
                    {card.title}
                  </p>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <p style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: card.color,
                      margin: '0 0 8px 0'
                    }}>
                      {card.value}
                    </p>
                  )}
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: card.bgColor,
                  borderRadius: '50%',
                  border: `2px solid ${card.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '28px' }}>{card.icon}</span>
                </div>
              </div>
              
              {/* Trend indicator
              {!isLoading && (
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4caf50',
                    fontWeight: '500'
                  }}>
                    <span style={{ marginRight: '4px' }}>↗</span>
                    +12% increase
                  </span>l
                  <span style={{ color: '#999999' }}>vs last week</span>
                </div>
              )} */}
            </div>
          ))}
        </div>

        {/* Welcome Section */}
        {!isLoading && !error && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#212121',
              margin: '0 0 12px 0'
            }}>
              Welcome to your Testing Dashboard! 🚀
            </h3>
            <p style={{
              color: '#666666',
              margin: '0 0 24px 0',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Your test suite is performing well. Monitor your automation health,
              track test execution trends, and ensure quality across your applications.
            </p>
            
            {/* Quick Actions */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
              >
                <span>🧪</span>
                View Tests
              </button>
              <button style={{
                backgroundColor: 'white',
                color: '#1976d2',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #1976d2',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e3f2fd'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <span>📋</span>
                Check Results
              </button>
              <button style={{
                backgroundColor: 'white',
                color: '#666666',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              onClick={() => navigate("/tests")}
              >
                <span>➕</span>
                Create Project
              </button>
            </div>
          </div>
        )}

        {/* Additional Dashboard Sections */}
        {!isLoading && !error && (
          <div style={{
            marginTop: '40px',
            display: 'grid',
            gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
            gap: '32px'
          }}>
            {/* Recent Activity */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#212121',
                margin: '0 0 16px 0'
              }}>
                Recent Activity
              </h3>
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: '#999999'
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📈</span>
                <p style={{ margin: 0 }}>Recent test activity will appear here</p>
              </div>
            </div>

            {/* System Health */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#212121',
                margin: '0 0 16px 0'
              }}>
                System Health
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { service: 'Playwright Service', status: 'Online' },
                  { service: 'Database Connection', status: 'Connected' },
                  { service: 'API Status', status: 'Operational' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '14px', color: '#666666' }}>{item.service}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#4caf50',
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#4caf50' }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;