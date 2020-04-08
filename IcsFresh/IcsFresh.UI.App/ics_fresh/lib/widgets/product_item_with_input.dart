import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../screens/product_detail_screen.dart';
import '../providers/product.dart';
import '../providers/cart.dart';
import '../providers/auth.dart';

class ProductItemWithInput extends StatefulWidget {
  // final String id;
  // final String title;
  // final String imageUrl;

  // ProductItem(this.id, this.title, this.imageUrl);

  @override
  _ProductItemWithInputState createState() => _ProductItemWithInputState();
}

class _ProductItemWithInputState extends State<ProductItemWithInput> {
  final _quantityController = TextEditingController();
  final _quantityFocusNode = FocusNode();
  var _isInit = true;

  @override
  void didChangeDependencies() {
    if (_isInit) {
    }
    _isInit = false;
    super.didChangeDependencies();
  }

  @override
  void initState() {
    _quantityFocusNode.addListener(_setQuantity);
    super.initState();
  }

  @override
  void dispose() {
    _quantityFocusNode.removeListener(_setQuantity);
    _quantityFocusNode.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  void _setQuantity() {
    if (!_quantityFocusNode.hasFocus) {
      print("nothasFocus");
    } else {
      print("hasFocus");
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = Provider.of<Product>(context, listen: false);
    final cartProvider = Provider.of<Cart>(context, listen: false);
    return Card(
      margin: EdgeInsets.symmetric(
        horizontal: 15,
        vertical: 4,
      ),
      child: Padding(
        padding: EdgeInsets.all(8),
        child: ListTile(
          leading: CircleAvatar(
            backgroundImage: NetworkImage(product.imageUrl),
          ),
          title: Text(product.title),
          subtitle: Text(
              'Total: \$${(product.price * cartProvider.getQuanlityByProductId(product.id))}'),
          trailing: Consumer<Cart>(
            builder: (_, cart, ch) => Container(
                width: 200,
                child: Row(
                  children: <Widget>[
                    Container(
                      width: 50,
                      child: TextFormField(
                        decoration: InputDecoration(labelText: 'Qty'),
                        keyboardType: TextInputType.url,
                        textInputAction: TextInputAction.next,
                        controller: _quantityController,
                        focusNode: _quantityFocusNode,
                        onFieldSubmitted: (value) {
                          cart.addItemQuantity(product.id, product.price, product.title, value);
                          _quantityController.text = '';
                          FocusScope.of(context).nextFocus();
                        },
                      ),
                    ),
                    Text('${cart.getQuanlityByProductId(product.id)} x'),
                    IconButton(
                      autofocus: false,
                      icon: Icon(
                        Icons.shopping_cart,
                      ),
                      onPressed: () {
                        cart.addItem(product.id, product.price, product.title);
                        Scaffold.of(context).hideCurrentSnackBar();
                        Scaffold.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Added item to cart!',
                            ),
                            duration: Duration(seconds: 2),
                            action: SnackBarAction(
                              label: 'UNDO',
                              onPressed: () {
                                cart.removeSingleItem(product.id);
                              },
                            ),
                          ),
                        );
                      },
                      color: Theme.of(context).accentColor,
                    ),
                  ],
                )),
          ),
        ),
      ),
    );
  }
}
