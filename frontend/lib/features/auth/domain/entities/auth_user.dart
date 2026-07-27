import 'package:equatable/equatable.dart';

enum UserRole { customer, vendor, admin }

/// Pure domain entity — no JSON/serialization concerns here.
class AuthUser extends Equatable {
  const AuthUser({required this.id, required this.email, required this.role});

  final String id;
  final String email;
  final UserRole role;

  @override
  List<Object?> get props => [id, email, role];
}
