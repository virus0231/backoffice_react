# Authentication Configuration

This document defines the authentication setup for the Nonprofit Fundraising Analytics Dashboard using NextAuth.js with a simple credentials-based approach suitable for internal team access.

## Authentication Strategy

Based on the project brief stating that "current database security measures are sufficient for dashboard access without additional authentication layers," the authentication approach prioritizes simplicity and internal team access over complex third-party integrations.

### Chosen Approach: Credentials Provider

The dashboard will use NextAuth.js with a credentials provider for simple username/password authentication suitable for small team internal access.

## NextAuth.js Configuration

### Core Configuration (`src/lib/auth/config.ts`)

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'Enter your username'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials) {
        // Simple credential validation
        // Note: In production, hash passwords and store in database
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: '1',
            name: 'Dashboard Admin',
            email: 'admin@organization.org',
            role: 'admin'
          };
        }

        // Additional team members can be added here
        const teamMembers = [
          {
            username: process.env.USER1_USERNAME,
            password: process.env.USER1_PASSWORD,
            name: 'Development Director',
            email: 'dev.director@organization.org',
            role: 'user'
          },
          {
            username: process.env.USER2_USERNAME,
            password: process.env.USER2_PASSWORD,
            name: 'Fundraising Manager',
            email: 'fundraising@organization.org',
            role: 'user'
          }
        ];

        const user = teamMembers.find(
          member =>
            member.username === credentials?.username &&
            member.password === credentials?.password
        );

        if (user) {
          return {
            id: user.username,
            name: user.name,
            email: user.email,
            role: user.role
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Provider Setup (`src/lib/auth/providers.ts`)

```typescript
import CredentialsProvider from 'next-auth/providers/credentials';

export const authProviders = [
  CredentialsProvider({
    id: 'credentials',
    name: 'Team Credentials',
    credentials: {
      username: {
        label: 'Username',
        type: 'text',
        placeholder: 'team-member-username'
      },
      password: {
        label: 'Password',
        type: 'password'
      }
    },
    async authorize(credentials) {
      // Validation logic (as defined in config.ts)
      return null; // Implemented in main config
    }
  })
];

// Future expansion options (commented out for initial implementation)
/*
export const futureProviders = [
  // Google OAuth for organization Google Workspace
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),

  // Microsoft Azure AD for organization Microsoft 365
  AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID,
  })
];
*/
```

## Environment Variables

### Required Authentication Variables (`.env.local`)

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password

# Team Member Credentials
USER1_USERNAME=dev.director
USER1_PASSWORD=secure-user1-password

USER2_USERNAME=fundraising.manager
USER2_PASSWORD=secure-user2-password

# Optional: Future OAuth Configuration (disabled by default)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# AZURE_AD_CLIENT_ID=your-azure-client-id
# AZURE_AD_CLIENT_SECRET=your-azure-client-secret
# AZURE_AD_TENANT_ID=your-azure-tenant-id
```

## API Route Setup

### NextAuth API Route (`src/app/api/auth/[...nextauth]/route.ts`)

```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Custom Login Endpoint (`src/app/api/auth/login/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user,
    expires: session.expires
  });
}
```

## Route Protection

### Middleware (`middleware.ts`)

```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/analytics/:path*',
    '/reports/:path*'
  ]
};
```

## Custom Auth Components

### Sign In Page (`src/app/auth/signin/page.tsx`)

```typescript
'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username: credentials.username,
      password: credentials.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Analytics Dashboard Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>

          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

## Security Considerations

### Production Security Measures

1. **Password Security**
   - Use environment variables for all credentials
   - Consider hashing passwords in a future database integration
   - Implement password complexity requirements

2. **Session Security**
   - 8-hour session timeout for security
   - JWT-based sessions for simplicity
   - Secure cookie configuration

3. **Future Enhancements**
   - OAuth integration with organization's existing identity provider
   - Role-based access control for different dashboard sections
   - Activity logging and audit trail

### Development vs Production

**Development:**
- Simple username/password authentication
- Environment variable credentials
- Local session storage

**Production Recommendations:**
- Consider OAuth integration with existing organizational systems
- Implement proper password hashing if using database storage
- Enable HTTPS and secure cookie configuration
- Add login attempt rate limiting

## Integration Points

### Story Integration
- **Story 1.1**: NextAuth.js installation and basic setup
- **Story 1.2**: No database integration for auth (keeps it simple)
- **All Chart Stories**: Session-based API route protection

### Architecture Integration
- Fits with cPanel hosting (no external OAuth dependencies required)
- Simple deployment (no additional service provisioning)
- Minimal configuration overhead for small team use

This authentication configuration provides a secure, simple foundation that can be enhanced over time as the organization's needs evolve.