import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/auth_user.dart';

/// Domain-level contract. The presentation layer depends only on this
/// interface, never on the Dio-based implementation in data/.
abstract class AuthRepository {
  Future<Either<Failure, AuthUser>> login(String email, String password);
  Future<Either<Failure, AuthUser>> register(
    String fullName,
    String email,
    String password,
  );
  Future<void> logout();
  Future<AuthUser?> currentUser();
}
