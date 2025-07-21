import { CheckCircle } from "lucide-react";

export function JsonInfoArticle() {
    return (
        <div className="text-foreground/90 max-w-4xl mx-auto">
            <article className="prose prose-lg dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80">
                <h2 className="text-3xl font-bold font-headline">The Ultimate Online JSON Editor for Developers</h2>
                <p>
                    JSON Editor Pro is a powerful, free, and intuitive online tool designed to help developers and data analysts view, edit, and format JSON data effortlessly.
                    Whether you are debugging an API response, creating configuration files, or simply exploring a JSON dataset, our tool provides a clean, user-friendly tree view to streamline your workflow.
                </p>

                <h3 className="text-2xl font-bold font-headline mt-8">Key Features</h3>
                <ul className="space-y-4">
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Interactive Tree View:</strong> Navigate your JSON structure with ease. Expand and collapse nodes to focus on the data that matters.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Load from Anywhere:</strong> Upload a JSON file from your local machine or fetch data directly from a remote URL.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Powerful Editing:</strong> Add, edit, duplicate, and delete nodes on the fly. Change data types (e.g., string, number, boolean) with a simple dropdown menu.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Smart Search:</strong> Quickly find keys or values within your JSON data. Search results are automatically highlighted and their parent nodes expanded.</span>
                    </li>
                     <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Visual HTML Editor:</strong> Edit HTML content embedded within your JSON strings using an intuitive WYSIWYG editor.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>One-Click Download:</strong> Download your edited and beautifully formatted JSON file with a single click.</span>
                    </li>
                </ul>

                <h3 className="text-2xl font-bold font-headline mt-8">What is JSON?</h3>
                <p>
                    JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is based on a subset of the JavaScript Programming Language and has become the de facto standard for data transmission in web applications.
                </p>
                <p>
                    A JSON object consists of a collection of key/value pairs, where keys are strings and values can be strings, numbers, booleans, arrays, or other JSON objects. This versatility makes it ideal for a wide range of applications.
                </p>
                
                <h3 className="text-2xl font-bold font-headline mt-8">Common Uses for a JSON Editor</h3>
                <ul>
                    <li><strong>API Development and Testing:</strong> Developers can paste API responses to quickly inspect and debug the data structure.</li>
                    <li><strong>Configuration Management:</strong> Many applications use JSON for configuration files. An editor makes it easy to manage these settings without syntax errors.</li>
                    <li><strong>Data Analysis:</strong> Data scientists and analysts can use the tool to explore and understand the structure of JSON datasets.</li>
                    <li><strong>Learning and Education:</strong> Students learning about data structures can use the editor to visualize how JSON objects and arrays are built.</li>
                </ul>
            </article>
          </div>
    )
}
