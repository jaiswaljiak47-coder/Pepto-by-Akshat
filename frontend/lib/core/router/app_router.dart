import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/customer/home/presentation/screens/home_screen.dart';
import '../../features/vendor/dashboard/presentation/screens/vendor_dashboard_screen.dart';
import '../../features/admin/dashboard/presentation/screens/admin_dashboard_screen.dart';

/// Single source of truth for app navigation. Redirect logic reads the
/// current auth state (and role) from authStateProvider to route customers,
/// vendors, and admins to their respective shells after login.
final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/vendor',
        builder: (context, state) => const VendorDashboardScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
    ],
    // redirect: (context, state) { ... role-based guard using authStateProvider ... },
  );
});
