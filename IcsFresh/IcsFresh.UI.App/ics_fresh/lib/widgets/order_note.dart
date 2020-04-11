import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ics_fresh/providers/cart.dart';
import 'package:provider/provider.dart';

class OrderNote extends StatefulWidget {
  const OrderNote({
    Key key,
  }) : super(key: key);

  @override
  _OrderNoteState createState() => _OrderNoteState();
}

class _OrderNoteState extends State<OrderNote> {
  void _showOrderDeliveryDatePicker(BuildContext context,Cart cart) {
    showDatePicker(
            context: context,
            initialDate: cart.deliveryDate,
            firstDate: DateTime.now(),
            lastDate: DateTime(2021))
        .then((value) {
      if (value == null) {
        return;
      }
      cart.setDeliveryDate(value);
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<Cart>(context);
    return Row(
      children: <Widget>[
        Text('Delivery Date'),
        Text(DateFormat.yMd().format(cart.deliveryDate)),
        FlatButton(
          textColor: Theme.of(context).primaryColor,
          child: Text('Choose date'),
          onPressed: () => {_showOrderDeliveryDatePicker(context, cart)},
        ),
      ],
    );
  }
}
