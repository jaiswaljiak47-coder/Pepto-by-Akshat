import 'package:flutter/material.dart';

/// Mirrors LoginScreen's structure with an added fullName field and a call
/// to AuthRepository.register(). Omitted here for brevity — see login_screen.dart
/// for the pattern (Riverpod StateNotifier + go_router redirect on success).
class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Register — TODO')));
  }
}
