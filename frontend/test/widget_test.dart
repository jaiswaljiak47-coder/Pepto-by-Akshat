import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pepto/main.dart';

void main() {
  testWidgets('App boots and shows the login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: PeptoApp()));
    await tester.pumpAndSettle();
    expect(find.text('PEPTO'), findsOneWidget);
  });
}
