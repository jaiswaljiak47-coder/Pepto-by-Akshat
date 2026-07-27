import 'package:flutter/material.dart';

/// Customer home: product feed, search, categories, cart badge.
/// Fetches from GET /products via a ProductsRepository (same clean-arch
/// pattern as features/auth) — wire up ProductsProvider here.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PEPTO')),
      body: const Center(child: Text('Product feed — TODO')),
    );
  }
}
