import 'package:flutter/material.dart';

/// Admin shell: vendor approval queue, platform metrics, user management.
/// Guarded by role == admin in the router's redirect callback.
class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      body: const Center(child: Text('Admin dashboard — TODO')),
    );
  }
}
