#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    if (s[0] == '-') {
        cout << "false" << endl;
        return 0;
    }
    string temp = s;
    reverse(temp.begin(), temp.end());
    cout << (temp == s ? "true" : "false") << endl;
    return 0;
}
