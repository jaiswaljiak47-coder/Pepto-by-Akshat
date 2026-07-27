import 'package:flutter/material.dart';

/// Vendor shell: sales summary, recent orders, quick links to
/// product management and payout status. Guarded by role == vendor
/// in the router's redirect callback.
class VendorDashboardScreen extends StatelessWidget {
  const VendorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vendor Dashboard')),
      body: const Center(child: Text('Vendor dashboard — TODO')),
    );
  }
}
